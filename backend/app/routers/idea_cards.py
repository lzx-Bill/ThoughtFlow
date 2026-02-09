from fastapi import APIRouter, HTTPException, Query, status
from datetime import datetime
from typing import Optional
from bson import ObjectId
from uuid import uuid4

from app.database import get_database
from app.models.idea_card import COLLECTION_NAME, DEFAULT_CARD_STYLE
from app.schemas.idea_card import (
    IdeaCardCreate,
    IdeaCardUpdate,
    IdeaCardResponse,
    IdeaCardListResponse,
    EditHistoryResponse,
    MessageResponse,
    TimelineEvent,
    TimelineResponse,
    CardStyle,
    EditHistoryItem,
    ChangeContent,
)

router = APIRouter(prefix="/api", tags=["idea-cards"])


def convert_id(doc: dict) -> dict:
    """将 MongoDB _id 转换为字符串"""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def build_card_response(doc: dict) -> IdeaCardResponse:
    """构建卡片响应对象"""
    doc = convert_id(doc)
    # 确保 card_style 存在
    if "card_style" not in doc or doc["card_style"] is None:
        doc["card_style"] = DEFAULT_CARD_STYLE
    # 确保 todos 存在
    if "todos" not in doc:
        doc["todos"] = []
    # 确保 edit_history 存在
    if "edit_history" not in doc:
        doc["edit_history"] = []
    return IdeaCardResponse(**doc)


@router.post("/idea-card", response_model=IdeaCardResponse, status_code=status.HTTP_201_CREATED)
async def create_idea_card(card: IdeaCardCreate):
    """
    新建想法卡片
    
    - **title**: 想法标题
    - **content**: 想法内容
    - **card_style**: 可选，卡片样式
    """
    db = get_database()
    
    now = datetime.utcnow()
    card_style = card.card_style.model_dump() if card.card_style else DEFAULT_CARD_STYLE
    
    doc = {
        "title": card.title,
        "content": card.content,
        "card_style": card_style,
        "todos": [],
        "is_deleted": False,
        "create_time": now,
        "update_time": now,
        "edit_history": []
    }
    
    result = await db[COLLECTION_NAME].insert_one(doc)
    doc["_id"] = result.inserted_id
    
    return build_card_response(doc)


@router.get("/idea-cards", response_model=IdeaCardListResponse)
async def get_idea_cards():
    """
    查询所有正常卡片（未删除）
    
    返回按更新时间倒序排列的卡片列表
    """
    db = get_database()
    
    cursor = db[COLLECTION_NAME].find({"is_deleted": False}).sort("update_time", -1)
    cards = await cursor.to_list(length=1000)
    
    return IdeaCardListResponse(
        cards=[build_card_response(card) for card in cards],
        total=len(cards)
    )


@router.get("/idea-cards/deleted", response_model=IdeaCardListResponse)
async def get_deleted_cards():
    """
    查询所有已删除卡片
    
    返回按删除时间倒序排列的卡片列表
    """
    db = get_database()
    
    cursor = db[COLLECTION_NAME].find({"is_deleted": True}).sort("update_time", -1)
    cards = await cursor.to_list(length=1000)
    
    return IdeaCardListResponse(
        cards=[build_card_response(card) for card in cards],
        total=len(cards)
    )


@router.put("/idea-card/{card_id}", response_model=IdeaCardResponse)
async def update_idea_card(card_id: str, update: IdeaCardUpdate):
    """
    编辑想法卡片
    
    自动记录编辑历史，仅当内容有实际变化时才追加历史记录
    
    - **title**: 新标题
    - **content**: 新内容
    - **card_style**: 新样式
    - **old_title**: 原标题（用于对比）
    - **old_content**: 原内容（用于对比）
    - **old_card_style**: 原样式（用于对比）
    - **operator**: 操作人
    - **edit_note**: 编辑备注
    """
    db = get_database()
    
    # 验证卡片存在
    try:
        object_id = ObjectId(card_id)
    except Exception:
        raise HTTPException(status_code=400, detail="无效的卡片ID")
    
    existing = await db[COLLECTION_NAME].find_one({"_id": object_id})
    if not existing:
        raise HTTPException(status_code=404, detail="卡片不存在")
    
    if existing.get("is_deleted"):
        raise HTTPException(status_code=400, detail="已删除的卡片无法编辑")
    
    # 检查是否有实际变化
    new_style = update.card_style.model_dump() if update.card_style else DEFAULT_CARD_STYLE
    old_style = update.old_card_style.model_dump() if update.old_card_style else DEFAULT_CARD_STYLE
    
    # 转换todos为字典格式用于比较
    new_todos = [todo.model_dump() for todo in update.todos]
    old_todos = [todo.model_dump() for todo in update.old_todos]
    
    has_title_change = update.title != update.old_title
    has_content_change = update.content != update.old_content
    has_style_change = new_style != old_style
    has_todos_change = new_todos != old_todos
    
    if not (has_title_change or has_content_change or has_style_change or has_todos_change):
        raise HTTPException(status_code=400, detail="无修改内容，无需保存")
    
    now = datetime.utcnow()
    
    # 构建变更内容
    change_content = {}
    if has_title_change:
        change_content["title"] = {"old": update.old_title, "new": update.title}
    if has_content_change:
        change_content["content"] = {"old": update.old_content, "new": update.content}
    if has_style_change:
        change_content["card_style"] = {"old": old_style, "new": new_style}
    if has_todos_change:
        change_content["todos"] = {"old": old_todos, "new": new_todos}
    
    # 构建历史记录
    history_item = {
        "history_id": str(uuid4()),
        "edit_time": now,
        "operator": update.operator or "anonymous",
        "change_content": change_content,
        "edit_note": update.edit_note
    }
    
    # 原子更新：更新卡片内容 + 追加历史记录
    update_result = await db[COLLECTION_NAME].update_one(
        {"_id": object_id},
        {
            "$set": {
                "title": update.title,
                "content": update.content,
                "card_style": new_style,
                "todos": new_todos,
                "update_time": now
            },
            "$push": {"edit_history": history_item}
        }
    )
    
    if update_result.modified_count == 0:
        raise HTTPException(status_code=500, detail="更新失败")
    
    # 获取更新后的文档
    updated = await db[COLLECTION_NAME].find_one({"_id": object_id})
    return build_card_response(updated)


@router.patch("/idea-card/{card_id}/delete", response_model=MessageResponse)
async def soft_delete_card(card_id: str):
    """
    逻辑删除卡片
    
    仅修改 is_deleted 字段为 True，数据完整保留
    """
    db = get_database()
    
    try:
        object_id = ObjectId(card_id)
    except Exception:
        raise HTTPException(status_code=400, detail="无效的卡片ID")
    
    existing = await db[COLLECTION_NAME].find_one({"_id": object_id})
    if not existing:
        raise HTTPException(status_code=404, detail="卡片不存在")
    
    if existing.get("is_deleted"):
        raise HTTPException(status_code=400, detail="卡片已处于删除状态")
    
    await db[COLLECTION_NAME].update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_deleted": True,
                "update_time": datetime.utcnow()
            }
        }
    )
    
    return MessageResponse(message="卡片已删除，可在已删除列表中恢复", success=True)


@router.patch("/idea-card/{card_id}/recover", response_model=MessageResponse)
async def recover_card(card_id: str):
    """
    恢复已删除卡片
    
    将 is_deleted 字段改回 False
    """
    db = get_database()
    
    try:
        object_id = ObjectId(card_id)
    except Exception:
        raise HTTPException(status_code=400, detail="无效的卡片ID")
    
    existing = await db[COLLECTION_NAME].find_one({"_id": object_id})
    if not existing:
        raise HTTPException(status_code=404, detail="卡片不存在")
    
    if not existing.get("is_deleted"):
        raise HTTPException(status_code=400, detail="卡片未被删除，无需恢复")
    
    await db[COLLECTION_NAME].update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_deleted": False,
                "update_time": datetime.utcnow()
            }
        }
    )
    
    return MessageResponse(message="卡片已恢复", success=True)


@router.get("/idea-card/{card_id}/history", response_model=EditHistoryResponse)
async def get_card_history(card_id: str):
    """
    查询单张卡片的编辑历史
    
    返回按编辑时间倒序排列的历史记录列表
    """
    db = get_database()
    
    try:
        object_id = ObjectId(card_id)
    except Exception:
        raise HTTPException(status_code=400, detail="无效的卡片ID")
    
    card = await db[COLLECTION_NAME].find_one({"_id": object_id})
    if not card:
        raise HTTPException(status_code=404, detail="卡片不存在")
    
    # 按编辑时间倒序排列
    history = card.get("edit_history", [])
    history_sorted = sorted(history, key=lambda x: x.get("edit_time", datetime.min), reverse=True)
    
    return EditHistoryResponse(
        card_id=str(card["_id"]),
        card_title=card["title"],
        total_edits=len(history),
        history=history_sorted
    )


@router.get("/idea-card/{card_id}", response_model=IdeaCardResponse)
async def get_idea_card(card_id: str):
    """
    获取单张卡片详情
    """
    db = get_database()
    
    try:
        object_id = ObjectId(card_id)
    except Exception:
        raise HTTPException(status_code=400, detail="无效的卡片ID")
    
    card = await db[COLLECTION_NAME].find_one({"_id": object_id})
    if not card:
        raise HTTPException(status_code=404, detail="卡片不存在")
    
    return build_card_response(card)


def _diff_todos(old_todos: list, new_todos: list, card_id: str, card_title: str, event_time: datetime) -> list[TimelineEvent]:
    """比较新旧待办事项列表，生成增删改事件"""
    events = []
    old_map = {t.get("todo_id", ""): t for t in old_todos if t.get("todo_id")}
    new_map = {t.get("todo_id", ""): t for t in new_todos if t.get("todo_id")}

    # 新增的 todo
    for tid, todo in new_map.items():
        if tid not in old_map:
            events.append(TimelineEvent(
                event_id=str(uuid4()),
                event_type="todo_added",
                card_id=card_id,
                card_title=card_title,
                event_time=event_time,
                description=f"「{card_title}」新增待办: {todo.get('text', '')}",
                details={"todo_text": todo.get("text", ""), "todo_id": tid}
            ))

    # 删除的 todo
    for tid, todo in old_map.items():
        if tid not in new_map:
            events.append(TimelineEvent(
                event_id=str(uuid4()),
                event_type="todo_deleted",
                card_id=card_id,
                card_title=card_title,
                event_time=event_time,
                description=f"「{card_title}」删除待办: {todo.get('text', '')}",
                details={"todo_text": todo.get("text", ""), "todo_id": tid}
            ))

    # 修改的 todo (text 或 completed 状态变化)
    for tid in new_map:
        if tid in old_map:
            old_t = old_map[tid]
            new_t = new_map[tid]
            changes = []
            if old_t.get("text") != new_t.get("text"):
                changes.append(f"内容: \"{old_t.get('text')}\" → \"{new_t.get('text')}\"")
            if old_t.get("completed") != new_t.get("completed"):
                status_str = "已完成" if new_t.get("completed") else "未完成"
                changes.append(f"状态: {status_str}")
            if changes:
                events.append(TimelineEvent(
                    event_id=str(uuid4()),
                    event_type="todo_updated",
                    card_id=card_id,
                    card_title=card_title,
                    event_time=event_time,
                    description=f"「{card_title}」更新待办: {new_t.get('text', '')} ({', '.join(changes)})",
                    details={
                        "todo_text": new_t.get("text", ""),
                        "old_todo_text": old_t.get("text", ""),
                        "todo_id": tid,
                        "changes": changes
                    }
                ))

    return events


@router.get("/timeline", response_model=TimelineResponse)
async def get_global_timeline(
    start_time: Optional[str] = Query(None, description="起始时间 ISO 格式"),
    end_time: Optional[str] = Query(None, description="结束时间 ISO 格式"),
):
    """
    获取全局操作时间线
    
    汇总所有卡片的创建、删除、标题修改和待办事项变更事件。
    支持按时间范围筛选。
    """
    db = get_database()
    
    # 解析时间范围
    dt_start = None
    dt_end = None
    if start_time:
        try:
            dt_start = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=400, detail="无效的起始时间格式")
    if end_time:
        try:
            dt_end = datetime.fromisoformat(end_time.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=400, detail="无效的结束时间格式")

    # 获取所有卡片(包括已删除)
    cursor = db[COLLECTION_NAME].find({})
    all_cards = await cursor.to_list(length=5000)

    events: list[TimelineEvent] = []

    for card in all_cards:
        card_id = str(card["_id"])
        card_title = card.get("title", "未命名")
        create_time = card.get("create_time")
        is_deleted = card.get("is_deleted", False)

        # 1. 卡片创建事件
        if create_time:
            events.append(TimelineEvent(
                event_id=str(uuid4()),
                event_type="card_created",
                card_id=card_id,
                card_title=card_title,
                event_time=create_time,
                description=f"新增「{card_title}」",
            ))

        # 2. 卡片删除事件 (is_deleted=True 且没有后续恢复)
        if is_deleted:
            delete_time = card.get("update_time", create_time)
            events.append(TimelineEvent(
                event_id=str(uuid4()),
                event_type="card_deleted",
                card_id=card_id,
                card_title=card_title,
                event_time=delete_time,
                description=f"删除「{card_title}」",
            ))

        # 3. 从 edit_history 提取标题变更和 todo 变更
        for hist in card.get("edit_history", []):
            cc = hist.get("change_content", {})
            edit_time = hist.get("edit_time")
            if not edit_time:
                continue

            # 标题变更
            if cc.get("title"):
                old_title = cc["title"].get("old", "")
                new_title = cc["title"].get("new", "")
                events.append(TimelineEvent(
                    event_id=str(uuid4()),
                    event_type="title_changed",
                    card_id=card_id,
                    card_title=card_title,
                    event_time=edit_time,
                    description=f"标题修改: 「{old_title}」→「{new_title}」",
                    details={"old_title": old_title, "new_title": new_title}
                ))

            # 待办事项变更
            if cc.get("todos"):
                old_todos = cc["todos"].get("old", [])
                new_todos = cc["todos"].get("new", [])
                todo_events = _diff_todos(old_todos, new_todos, card_id, card_title, edit_time)
                events.extend(todo_events)

    # 时间范围筛选
    if dt_start:
        events = [e for e in events if e.event_time >= dt_start]
    if dt_end:
        events = [e for e in events if e.event_time <= dt_end]

    # 按时间倒序排列
    events.sort(key=lambda e: e.event_time, reverse=True)

    return TimelineResponse(events=events, total=len(events))

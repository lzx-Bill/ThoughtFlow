from fastapi import APIRouter, HTTPException, status
from datetime import datetime
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
    
    has_title_change = update.title != update.old_title
    has_content_change = update.content != update.old_content
    has_style_change = new_style != old_style
    
    if not (has_title_change or has_content_change or has_style_change):
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

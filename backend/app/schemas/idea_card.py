from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class TodoItem(BaseModel):
    """待办事项"""
    todo_id: str = Field(..., description="待办事项唯一ID")
    text: str = Field(..., min_length=1, max_length=500, description="待办内容")
    completed: bool = Field(default=False, description="是否完成")
    create_time: datetime = Field(..., description="创建时间")
    update_time: datetime = Field(..., description="最后更新时间")


class CardStyle(BaseModel):
    """卡片样式"""
    bg_color: str = Field(default="#FFF9C4", description="背景色")
    text_color: str = Field(default="#333333", description="文字色")
    border_radius: str = Field(default="20px", description="圆角")
    shadow: str = Field(default="soft", description="阴影类型")


class ChangeContent(BaseModel):
    """修改内容详情"""
    title: Optional[dict[str, str]] = Field(default=None, description="标题变更 {old, new}")
    content: Optional[dict[str, str]] = Field(default=None, description="内容变更 {old, new}")
    card_style: Optional[dict[str, Any]] = Field(default=None, description="样式变更 {old, new}")
    todos: Optional[dict[str, list]] = Field(default=None, description="待办事项变更 {old, new}")


class EditHistoryItem(BaseModel):
    """编辑历史记录项"""
    history_id: str = Field(..., description="历史记录唯一ID")
    edit_time: datetime = Field(..., description="编辑时间")
    operator: str = Field(default="anonymous", description="操作人")
    change_content: ChangeContent = Field(..., description="修改内容")
    edit_note: Optional[str] = Field(default=None, description="编辑备注")


class IdeaCardCreate(BaseModel):
    """创建想法卡片请求"""
    title: str = Field(..., min_length=1, max_length=100, description="想法标题")
    content: str = Field(..., min_length=1, max_length=2000, description="想法内容")
    card_style: Optional[CardStyle] = Field(default=None, description="卡片样式")


class IdeaCardUpdate(BaseModel):
    """更新想法卡片请求"""
    title: str = Field(..., min_length=1, max_length=100, description="新标题")
    content: str = Field(..., min_length=1, max_length=2000, description="新内容")
    card_style: Optional[CardStyle] = Field(default=None, description="新样式")
    todos: list[TodoItem] = Field(default=[], description="新待办事项列表")
    old_title: str = Field(..., description="原标题")
    old_content: str = Field(..., description="原内容")
    old_card_style: Optional[CardStyle] = Field(default=None, description="原样式")
    old_todos: list[TodoItem] = Field(default=[], description="原待办事项列表")
    operator: str = Field(default="anonymous", description="操作人")
    edit_note: Optional[str] = Field(default=None, description="编辑备注")


class IdeaCardResponse(BaseModel):
    """想法卡片响应"""
    id: str = Field(..., alias="_id", description="卡片ID")
    title: str = Field(..., description="想法标题")
    content: str = Field(..., description="想法内容")
    card_style: CardStyle = Field(..., description="卡片样式")
    todos: list[TodoItem] = Field(default=[], description="待办事项列表")
    is_deleted: bool = Field(default=False, description="是否已删除")
    create_time: datetime = Field(..., description="创建时间")
    update_time: datetime = Field(..., description="最后更新时间")
    edit_history: list[EditHistoryItem] = Field(default=[], description="编辑历史")
    
    class Config:
        populate_by_name = True


class IdeaCardListResponse(BaseModel):
    """想法卡片列表响应"""
    cards: list[IdeaCardResponse] = Field(..., description="卡片列表")
    total: int = Field(..., description="总数")


class EditHistoryResponse(BaseModel):
    """编辑历史响应"""
    card_id: str = Field(..., description="卡片ID")
    card_title: str = Field(..., description="卡片标题")
    total_edits: int = Field(..., description="编辑次数")
    history: list[EditHistoryItem] = Field(..., description="历史记录列表")


class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str = Field(..., description="消息内容")
    success: bool = Field(default=True, description="是否成功")


class TimelineEvent(BaseModel):
    """全局时间线事件"""
    event_id: str = Field(..., description="事件唯一ID")
    event_type: str = Field(..., description="事件类型: card_created, card_deleted, title_changed, todo_added, todo_updated, todo_deleted")
    card_id: str = Field(..., description="关联卡片ID")
    card_title: str = Field(..., description="卡片标题")
    event_time: datetime = Field(..., description="事件时间")
    description: str = Field(..., description="事件描述")
    details: Optional[dict[str, Any]] = Field(default=None, description="事件详情")


class TimelineResponse(BaseModel):
    """全局时间线响应"""
    events: list[TimelineEvent] = Field(..., description="时间线事件列表")
    total: int = Field(..., description="事件总数")

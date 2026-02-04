"""
想法卡片数据模型

MongoDB 文档结构：
{
  "_id": ObjectId,
  "title": str,
  "content": str,
  "card_style": {
    "bg_color": str,
    "text_color": str,
    "border_radius": str,
    "shadow": str
  },
  "is_deleted": bool,
  "create_time": datetime,
  "update_time": datetime,
  "edit_history": [
    {
      "history_id": str,
      "edit_time": datetime,
      "operator": str,
      "change_content": {
        "title": {"old": str, "new": str},
        "content": {"old": str, "new": str},
        "card_style": {"old": dict, "new": dict}
      },
      "edit_note": str
    }
  ]
}
"""

# 默认卡片样式预设
DEFAULT_CARD_STYLES = [
    {"bg_color": "#FFF9C4", "text_color": "#333333", "border_radius": "20px", "shadow": "soft"},  # 浅黄
    {"bg_color": "#FED7E2", "text_color": "#333333", "border_radius": "20px", "shadow": "soft"},  # 浅粉
    {"bg_color": "#E6F7FF", "text_color": "#333333", "border_radius": "20px", "shadow": "soft"},  # 浅蓝
    {"bg_color": "#E8F5E9", "text_color": "#333333", "border_radius": "20px", "shadow": "soft"},  # 浅绿
    {"bg_color": "#F3E5F5", "text_color": "#333333", "border_radius": "20px", "shadow": "soft"},  # 浅紫
    {"bg_color": "#FFE0B2", "text_color": "#333333", "border_radius": "20px", "shadow": "soft"},  # 浅橙
]

# 默认卡片样式
DEFAULT_CARD_STYLE = DEFAULT_CARD_STYLES[0]

# 集合名称
COLLECTION_NAME = "idea_cards"

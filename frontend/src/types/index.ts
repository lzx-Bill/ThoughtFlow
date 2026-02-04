// 待办事项类型
export interface TodoItem {
  todo_id: string;
  text: string;
  completed: boolean;
  create_time: string;
  update_time: string;
}

// 卡片样式类型
export interface CardStyle {
  bg_color: string;
  text_color: string;
  border_radius: string;
  shadow: string;
}

// 变更内容类型
export interface ChangeContent {
  title?: { old: string; new: string };
  content?: { old: string; new: string };
  card_style?: { old: CardStyle; new: CardStyle };
  todos?: { old: TodoItem[]; new: TodoItem[] };
}

// 编辑历史记录项
export interface EditHistoryItem {
  history_id: string;
  edit_time: string;
  operator: string;
  change_content: ChangeContent;
  edit_note?: string;
}

// 想法卡片
export interface IdeaCard {
  _id: string;
  title: string;
  content: string;
  todos: TodoItem[];
  card_style: CardStyle;
  is_deleted: boolean;
  create_time: string;
  update_time: string;
  edit_history: EditHistoryItem[];
}

// 创建卡片请求
export interface CreateCardRequest {
  title: string;
  content: string;
  card_style?: CardStyle;
}

// 更新卡片请求
export interface UpdateCardRequest {
  title: string;
  content: string;
  card_style?: CardStyle;
  todos: TodoItem[];
  old_title: string;
  old_content: string;
  old_card_style?: CardStyle;
  old_todos: TodoItem[];
  operator?: string;
  edit_note?: string;
}

// 卡片列表响应
export interface CardListResponse {
  cards: IdeaCard[];
  total: number;
}

// 编辑历史响应
export interface EditHistoryResponse {
  card_id: string;
  card_title: string;
  total_edits: number;
  history: EditHistoryItem[];
}

// 消息响应
export interface MessageResponse {
  message: string;
  success: boolean;
}

// 预设卡片样式
export const PRESET_CARD_STYLES: CardStyle[] = [
  { bg_color: "#FFF9C4", text_color: "#333333", border_radius: "20px", shadow: "soft" }, // 浅黄
  { bg_color: "#FED7E2", text_color: "#333333", border_radius: "20px", shadow: "soft" }, // 浅粉
  { bg_color: "#E6F7FF", text_color: "#333333", border_radius: "20px", shadow: "soft" }, // 浅蓝
  { bg_color: "#E8F5E9", text_color: "#333333", border_radius: "20px", shadow: "soft" }, // 浅绿
  { bg_color: "#F3E5F5", text_color: "#333333", border_radius: "20px", shadow: "soft" }, // 浅紫
  { bg_color: "#FFE0B2", text_color: "#333333", border_radius: "20px", shadow: "soft" }, // 浅橙
];

export const DEFAULT_CARD_STYLE: CardStyle = PRESET_CARD_STYLES[0];

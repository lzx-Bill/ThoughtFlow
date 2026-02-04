import { create } from 'zustand';
import type { IdeaCard, CreateCardRequest, UpdateCardRequest, EditHistoryResponse } from '../types';
import { ideaCardApi } from '../api';

interface CardStore {
  // 状态
  cards: IdeaCard[];
  deletedCards: IdeaCard[];
  isLoading: boolean;
  error: string | null;
  
  // 编辑状态
  editingCardId: string | null;
  editModalCard: IdeaCard | null;
  isEditModalOpen: boolean;
  
  // 弹窗状态
  isCreateModalOpen: boolean;
  isDeletedViewOpen: boolean;
  historyModalData: EditHistoryResponse | null;
  deleteConfirmCardId: string | null;
  
  // 操作方法
  fetchCards: () => Promise<void>;
  fetchDeletedCards: () => Promise<void>;
  createCard: (data: CreateCardRequest) => Promise<void>;
  updateCard: (cardId: string, data: UpdateCardRequest) => Promise<void>;
  softDeleteCard: (cardId: string) => Promise<void>;
  recoverCard: (cardId: string) => Promise<void>;
  fetchHistory: (cardId: string) => Promise<void>;
  
  // UI 状态方法
  setEditingCardId: (cardId: string | null) => void;
  setEditModalCard: (card: IdeaCard | null) => void;
  setEditModalOpen: (open: boolean) => void;
  setCreateModalOpen: (open: boolean) => void;
  setDeletedViewOpen: (open: boolean) => void;
  setHistoryModalData: (data: EditHistoryResponse | null) => void;
  setDeleteConfirmCardId: (cardId: string | null) => void;
  clearError: () => void;
}

export const useCardStore = create<CardStore>((set, get) => ({
  // 初始状态
  cards: [],
  deletedCards: [],
  isLoading: false,
  error: null,
  editModalCard: null,
  isEditModalOpen: false,
  
  editingCardId: null,
  
  isCreateModalOpen: false,
  isDeletedViewOpen: false,
  historyModalData: null,
  deleteConfirmCardId: null,
  
  // 获取所有正常卡片
  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await ideaCardApi.getAll();
      set({ cards: response.cards, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  // 获取所有已删除卡片
  fetchDeletedCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await ideaCardApi.getDeleted();
      set({ deletedCards: response.cards, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  // 创建卡片
  createCard: async (data: CreateCardRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newCard = await ideaCardApi.create(data);
      set((state) => ({
        cards: [newCard, ...state.cards],
        isLoading: false,
        isCreateModalOpen: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  // 更新卡片
  updateCard: async (cardId: string, data: UpdateCardRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCard = await ideaCardApi.update(cardId, data);
      set((state) => ({
        cards: state.cards.map((card) =>
          card._id === cardId ? updatedCard : card
        ),
        editModalCard: null,
        isEditModalOpen: false,
        isLoading: false,
        editingCardId: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  // 软删除卡片
  softDeleteCard: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      await ideaCardApi.softDelete(cardId);
      const deletedCard = get().cards.find((c) => c._id === cardId);
      set((state) => ({
        cards: state.cards.filter((card) => card._id !== cardId),
        deletedCards: deletedCard
          ? [{ ...deletedCard, is_deleted: true }, ...state.deletedCards]
          : state.deletedCards,
        isLoading: false,
        deleteConfirmCardId: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  // 恢复卡片
  recoverCard: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      await ideaCardApi.recover(cardId);
      const recoveredCard = get().deletedCards.find((c) => c._id === cardId);
      set((state) => ({
        deletedCards: state.deletedCards.filter((card) => card._id !== cardId),
        cards: recoveredCard
          ? [{ ...recoveredCard, is_deleted: false }, ...state.cards]
          : state.cards,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  // 获取编辑历史
  fetchHistory: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const history = await ideaCardApi.getHistory(cardId);
      set({ historyModalData: history, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  // UI 状态方法
  setEditingCardId: (cardId) => set({ editingCardId: cardId }),
  setEditModalCard: (card) => set({ editModalCard: card }),
  setEditModalOpen: (open) => set({ isEditModalOpen: open }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setDeletedViewOpen: (open) => set({ isDeletedViewOpen: open }),
  setHistoryModalData: (data) => set({ historyModalData: data }),
  setDeleteConfirmCardId: (cardId) => set({ deleteConfirmCardId: cardId }),
  clearError: () => set({ error: null }),
}));

import { create } from 'zustand';

export interface Message {
  id: string;
  question: string;
  answer: string;
  citations?: { knowledgeId: string; title: string; article?: string }[];
  createdAt?: string;
}

export interface Conversation {
  id: string;
  title?: string | null;
  createdAt: string;
  messages: Message[];
  messageCount?: number;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  createConversation: (title?: string | null, id?: string, createdAt?: string) => string;
  addMessage: (message: Message, conversationId?: string) => void;
  setCurrentConversation: (conversationId: string) => void;
  setConversations: (conversations: Conversation[]) => void;
  setConversationMessages: (
    conversationId: string,
    payload: { messages: Message[]; title?: string | null; createdAt?: string; messageCount?: number },
  ) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentConversationId: null,

  createConversation: (title, id, createdAt) => {
    const generatedId = id ?? crypto.randomUUID();
    const newConversation: Conversation = {
      id: generatedId,
      title: title || null,
      createdAt: createdAt ?? new Date().toISOString(),
      messages: [],
      messageCount: 0,
    };
    set((state) => ({
      conversations: [...state.conversations, newConversation],
      currentConversationId: generatedId,
    }));
    return generatedId;
  },

  addMessage: (message, conversationId) =>
    set((state) => {
      const targetId = conversationId ?? state.currentConversationId;
      if (!targetId) return state;
      const conversations = state.conversations.map((c) =>
        c.id === targetId
          ? {
              ...c,
              messages: [...c.messages, message],
              messageCount: (c.messageCount ?? c.messages.length) + 1,
            }
          : c,
      );
      return { conversations };
    }),

  setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),

  setConversations: (conversations) => set({ conversations }),

  setConversationMessages: (conversationId, payload) =>
    set((state) => {
      const existing = state.conversations.find((c) => c.id === conversationId);
      const updatedConversation: Conversation = existing
        ? {
            ...existing,
            title: payload.title ?? existing.title,
            createdAt: payload.createdAt ?? existing.createdAt,
            messages: payload.messages,
            messageCount: payload.messageCount ?? payload.messages.length,
          }
        : {
            id: conversationId,
            title: payload.title ?? null,
            createdAt: payload.createdAt ?? new Date().toISOString(),
            messages: payload.messages,
            messageCount: payload.messageCount ?? payload.messages.length,
          };

      const conversations = existing
        ? state.conversations.map((c) => (c.id === conversationId ? updatedConversation : c))
        : [...state.conversations, updatedConversation];

      return { conversations, currentConversationId: conversationId };
    }),

  resetChat: () => set({ conversations: [], currentConversationId: null }),
}));

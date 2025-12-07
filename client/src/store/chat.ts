import { create } from 'zustand';

export interface Message {
  id: string;
  question: string;
  answer: string;
  citations?: { knowledgeId: string; title: string; article?: string }[];
  createdAt?: string;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
  setMessages: (messages) => set({ messages }),
}));

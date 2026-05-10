import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CHAT_THREADS, CHAT_MESSAGES } from "@/data/mockData";

export interface Message {
  id: string;
  from: "me" | string;
  type: "text" | "image" | "product" | "voice";
  text?: string;
  time: string;
  read: boolean;
  productId?: string;
  voiceDuration?: string;
  replyTo?: string;
  forwarded?: boolean;
  reactions?: { emoji: string; count: number; mine: boolean }[];
}

export interface Thread {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup: boolean;
  lastMsgFrom: "me" | "them";
  verified?: boolean;
}

interface ChatContextType {
  threads: Thread[];
  messages: Record<string, Message[]>;
  sendMessage: (threadId: string, text: string, type?: Message["type"], extra?: Partial<Message>) => void;
  markAsRead: (threadId: string) => void;
  getThreadById: (id: string) => Thread | undefined;
}

const ChatContext = createContext<ChatContextType | null>(null);

const STORAGE_KEY_MESSAGES = "vanik_chat_messages";
const STORAGE_KEY_THREADS = "vanik_chat_threads";

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>(CHAT_THREADS as Thread[]);
  const [messages, setMessages] = useState<Record<string, Message[]>>(CHAT_MESSAGES as Record<string, Message[]>);

  const sendMessage = useCallback((threadId: string, text: string, type: Message["type"] = "text", extra: Partial<Message> = {}) => {
    const newMessage: Message = {
      id: "msg_" + Date.now(),
      from: "me",
      type,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      ...extra,
    };

    setMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMessage],
    }));

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              lastMsg: type === "text" ? text : `[${type}]`,
              time: "Just now",
              lastMsgFrom: "me",
            }
          : t
      )
    );

    // Simulate auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: "reply_" + Date.now(),
        from: threadId,
        type: "text",
        text: "Thanks for the message! I'll get back to you soon. 😊",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };

      setMessages((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), reply],
      }));

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                lastMsg: reply.text!,
                time: "Just now",
                lastMsgFrom: "them",
                unread: t.unread + 1,
              }
            : t
        )
      );
    }, 2000);
  }, []);

  const markAsRead = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t))
    );
  }, []);

  const getThreadById = useCallback((id: string) => {
    return threads.find((t) => t.id === id);
  }, [threads]);

  return (
    <ChatContext.Provider
      value={{
        threads,
        messages,
        sendMessage,
        markAsRead,
        getThreadById,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

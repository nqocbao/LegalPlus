import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../lib/api";
import { useChatStore } from "../store/chat";
import { Message } from "../store/chat";

function HistoryPage() {
  const navigate = useNavigate();
  const { conversations, setConversations, setConversationMessages } = useChatStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const useMockChat = (import.meta.env.VITE_USE_MOCK_CHAT ?? "false") === "true";

  useEffect(() => {
    if (useMockChat) return;

    const fetchConversations = async () => {
      try {
        const res = await api.get("/chat/conversations", { params: { pageSize: 20 } });
        const items = res.data?.data ?? [];

        const counts = await Promise.all(
          items.map(async (c: any) => {
            try {
              const resCount = await api.get(`/chat/conversations/${c.id}/messages`, {
                params: { pageSize: 1 },
              });
              const total =
                resCount.data?.totalItems ??
                resCount.data?.total ??
                resCount.data?.paging?.totalItems ??
                0;
              return { id: c.id, total };
            } catch (err) {
              console.error("Không lấy được số lượng tin nhắn", err);
              return { id: c.id, total: 0 };
            }
          }),
        );

        const countMap = new Map(counts.map((c) => [String(c.id), c.total]));

        const mapped = items.map((c: any) => {
          const existing = conversations.find((s) => s.id === String(c.id));
          return {
            id: String(c.id),
            title: c.title ?? existing?.title ?? null,
            createdAt: c.startedAt ?? c.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
            messages: existing?.messages ?? [],
            messageCount: countMap.get(String(c.id)) ?? existing?.messageCount ?? 0,
          };
        });

        setConversations(mapped);
      } catch (error) {
        console.error("Không lấy được danh sách hội thoại", error);
      }
    };

    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapApiMessagesToPairs = (apiMessages: any[]): Message[] => {
    const sorted = [...apiMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const pairs: Message[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const msg = sorted[i];
      if (msg.senderType !== "USER") continue;
      const next = sorted[i + 1];
      const answerMsg = next?.senderType === "ASSISTANT" ? next : null;
      pairs.push({
        id: String(answerMsg?.id ?? msg.id),
        question: msg.content,
        answer: answerMsg?.content ?? "(Chưa có trả lời)",
        citations: [],
        createdAt: msg.createdAt,
      });
    }
    return pairs;
  };

  const handleOpenConversation = async (conversationId: string) => {
    setLoadingId(conversationId);
    try {
      if (!useMockChat) {
        const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
          params: { pageSize: 100 },
        });
        const apiMessages = res.data?.data ?? res.data ?? [];
        const mapped = mapApiMessagesToPairs(apiMessages);
        setConversationMessages(conversationId, {
          messages: mapped,
          messageCount: res.data?.totalItems ?? res.data?.total ?? mapped.length,
        });
      }
      navigate("/chat");
    } catch (error) {
      console.error("Không tải được hội thoại", error);
    } finally {
      setLoadingId(null);
    }
  };

  const list = useMemo(() => conversations.slice().reverse(), [conversations]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg text-slate-900">
      <h2 className="text-lg font-semibold">Lịch sử hội thoại</h2>
      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-slate-600">Chưa có cuộc trò chuyện nào.</p>
        ) : (
          list.map((conv) => {
            const lastMsg = conv.messages.at(-1);
            return (
              <div
                key={conv.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer hover:bg-white"
                onClick={() => handleOpenConversation(conv.id)}
              >
                <p className="text-xs text-slate-500">{new Date(conv.createdAt).toLocaleString()}</p>
                <p className="mt-1 font-semibold text-slate-900">{conv.title || "Cuộc trò chuyện"}</p>
                <p className="text-xs text-slate-600">
                  {loadingId === conv.id
                    ? "Đang tải..."
                    : `${conv.messageCount ?? conv.messages.length} tin nhắn`}
                </p>
                {lastMsg ? (
                  <div className="mt-2 rounded-lg bg-white p-2 text-sm text-slate-800 border border-slate-200">
                    <div className="font-semibold text-primary">Bạn:</div>
                    <div className="text-slate-800">{lastMsg.question}</div>
                    <div className="mt-1 font-semibold text-emerald-600">AI:</div>
                    <div className="text-slate-800 line-clamp-3">{lastMsg.answer}</div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default HistoryPage;

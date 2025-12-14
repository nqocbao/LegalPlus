import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  FileSignature,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  Paperclip,
  Search,
  Send,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import api from "../lib/api";
import { useChatStore } from "../store/chat";

const sideNav = [
  { label: "Văn bản Pháp Luật", icon: FileText },
  { label: "Tra cứu Văn bản", icon: Search },
  { label: "Thủ tục hành chính", icon: FileSignature },
  { label: "Hỗ trợ", icon: HelpCircle },
];

const suggestedResults = [
  { source: "Google", count: 10 },
  { source: "TVPL", count: 0 },
];

function ChatPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const {
    conversations,
    currentConversationId,
    createConversation,
    addMessage,
    setCurrentConversation,
  } = useChatStore();
  const useMockChat = (import.meta.env.VITE_USE_MOCK_CHAT ?? "false") === "true";
  const endRef = useRef<HTMLDivElement | null>(null);

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === currentConversationId),
    [conversations, currentConversationId],
  );

  const messages = currentConversation?.messages ?? [];

  const history = useMemo(() => conversations.slice(-3).reverse(), [conversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, currentConversationId]);

  const mapRagToCitations = (ragContexts: any[] = []) =>
    ragContexts.map((ctx, idx) => ({
      knowledgeId: String(ctx.articleId ?? idx),
      title: ctx.articleTitle ?? "Trích dẫn",
      article: ctx.articleNumber
        ? `Điều ${ctx.articleNumber}${ctx.clauseNumber ? ", Khoản " + ctx.clauseNumber : ""}`
        : undefined,
    }));

  const handleStartNewConversation = async () => {
    setCreatingConversation(true);
    try {
      if (useMockChat) {
        createConversation();
        setInput("");
        return;
      }

      const res = await api.post("/chat/conversations", {
        title: input ? input.slice(0, 80) : "Cuộc trò chuyện mới",
      });
      const conversation = res.data;
      createConversation(
        conversation?.title ?? input.slice(0, 80) ?? "Cuộc trò chuyện",
        conversation?.id ? String(conversation.id) : undefined,
        conversation?.createdAt ?? conversation?.startedAt,
      );
      setInput("");
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      let conversationId = currentConversationId;

      if (!conversationId) {
        if (useMockChat) {
          conversationId = createConversation(input.slice(0, 80));
        } else {
          const resConversation = await api.post("/chat/conversations", {
            title: input.slice(0, 80),
          });
          const created = resConversation.data;
          conversationId = createConversation(
            created?.title ?? input.slice(0, 80),
            created?.id ? String(created.id) : undefined,
            created?.createdAt ?? created?.startedAt,
          );
        }
      }

      if (useMockChat) {
        addMessage(
          {
            id: crypto.randomUUID(),
            question: input,
            answer:
              "Đây là phản hồi mock để bạn kiểm thử giao diện chat. Khi kết nối backend, câu trả lời sẽ được tạo từ AI và có trích dẫn pháp lý.",
            citations: [
              {
                knowledgeId: "mock-1",
                title: "Luật giao thông đường bộ 2008",
                article: "Điều 9 - Quy tắc chung",
              },
            ],
            createdAt: new Date().toISOString(),
          },
          conversationId,
        );
        setInput("");
        return;
      }

      const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
        senderType: "USER",
        content: input,
        withRagContext: true,
      });

      const { userMessage, assistantMessage, ragContexts, answer } = res.data ?? {};
      const fallbackAnswer =
        assistantMessage?.content ?? answer ?? "(Backend chưa nối AI - trả lời tạm thời)";

      addMessage(
        {
          id: String(assistantMessage?.id ?? userMessage?.id ?? crypto.randomUUID()),
          question: userMessage?.content ?? input,
          answer: fallbackAnswer,
          citations: mapRagToCitations(ragContexts),
          createdAt: userMessage?.createdAt ?? new Date().toISOString(),
        },
        conversationId,
      );
      setInput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[240px,1fr,320px]">
      <Card className="bg-white/90">
        <CardContent className="p-4">
          <Button
            variant="outline"
            onClick={handleStartNewConversation}
            disabled={creatingConversation || loading}
            className="flex w-full items-center justify-between rounded-2xl border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-left text-slate-700 shadow-sm hover:border-primary/50 hover:bg-white"
          >
            <div className="flex items-center gap-2 font-medium">
              <MessageCircle className="h-5 w-5 text-primary" />
              Cuộc trò chuyện mới
            </div>
            <Badge className="bg-primary/10 text-primary">{creatingConversation ? "Đang tạo" : "Mới"}</Badge>
          </Button>

          <div className="mt-4 space-y-2 text-sm">
            {sideNav.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          <Card className="mt-4 border-slate-100 bg-slate-50">
            <CardContent className="p-3 text-xs text-slate-600">
              <p>Trò chuyện với AI về các vấn đề pháp luật một cách an toàn.</p>
              <p className="mt-2 font-semibold text-primary">AI Pro</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="bg-white/95">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <CardTitle className="text-slate-900">Chat với AI</CardTitle>
            <Badge>Pro</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Button variant="outline" className="gap-2 rounded-full px-3 py-1.5 text-slate-600">
              <Share2 className="h-4 w-4" />
              Chia sẻ
            </Button>
            <Button className="rounded-full bg-gradient-to-r from-primary to-sky-500 px-4 py-1.5 font-semibold text-white shadow hover:from-primary/90 hover:to-sky-500/90">
              Nâng cấp lên Pro
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <ScrollArea className="h-[calc(40vh)] pr-1">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              {messages.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-slate-700 shadow-inner">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Sparkles className="h-4 w-4" />
                    AI Luật
                  </div>
                  <p className="mt-2 leading-relaxed">
                    Xin chào! Bạn có thể hỏi tôi về các quyền và nghĩa vụ của một cá nhân theo luật pháp Việt Nam. Ví dụ: "Xe máy va chạm ô tô, ai bồi thường?".
                  </p>
                </div>
              ) : null}

              {messages.map((msg, idx) => {
                const isUser = true;
                return (
                  <div key={msg.id} className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-gradient-to-r from-amber-100 to-orange-50 px-4 py-3 shadow">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase text-amber-700">
                          <span>Bạn</span>
                          <span className="text-[10px] text-amber-600">#{idx + 1}</span>
                        </div>
                        <p className="mt-1 text-slate-900">{msg.question}</p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-[90%] rounded-2xl bg-white px-4 py-3 shadow border border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
                          <Sparkles className="h-4 w-4" /> AI Luật
                        </div>
                        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-800">{msg.answer}</p>
                        {msg.citations?.length ? (
                          <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                            <p className="font-semibold text-primary">Trích dẫn</p>
                            <ul className="mt-1 list-disc space-y-1 pl-4">
                              {msg.citations.map((c) => (
                                <li key={c.knowledgeId}>
                                  {c.title} {c.article ? `- ${c.article}` : ""}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <div className="mt-3 flex items-center gap-2 text-slate-400">
                          <ThumbsUp className="h-4 w-4" />
                          <ThumbsDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <Card className="border-slate-200 bg-slate-50/80 shadow-inner">
              <CardContent className="p-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn tại đây..."
                  className="h-24"
                />
                <div className="mt-3 flex items-center justify-between text-slate-500">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    <ImageIcon className="h-5 w-5" />
                    <Mic className="h-5 w-5" />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="gap-2 rounded-full px-4"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? "Đang xử lý..." : "Gửi"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <p className="text-center text-xs text-slate-500">
              Thông tin được tạo ra bởi AI. Hãy luôn cẩn trọng và sử dụng thông tin AI một cách có trách nhiệm.
            </p>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/90">
        <CardContent className="p-4">
          <Card className="mt-4 border-slate-100 bg-slate-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Lịch sử trò chuyện</p>
                <Badge className="text-[11px]">Hiểu về bạn</Badge>
              </div>
              <div className="mt-2 space-y-2 text-sm text-slate-600">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có cuộc trò chuyện nào.</p>
                ) : (
                  history.map((conv) => {
                    const lastMsg = conv.messages.at(-1);
                    return (
                      <Card
                        key={conv.id}
                        className={`bg-white hover:border-primary/40 cursor-pointer ${
                          conv.id === currentConversationId ? "border-primary/60" : "border-slate-200"
                        }`}
                        onClick={() => setCurrentConversation(conv.id)}
                      >
                        <CardContent className="px-3 py-2">
                          <p className="truncate font-medium text-slate-800">
                            {conv.title || lastMsg?.question || "Cuộc trò chuyện"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(conv.createdAt).toLocaleString()} · {conv.messages.length} tin nhắn
                          </p>
                          {lastMsg ? (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{lastMsg.answer}</p>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 border-slate-100 bg-slate-50">
            <CardContent className="p-3">
              <p className="text-sm font-semibold text-slate-800">Kết quả tìm kiếm tương tự</p>
              <div className="mt-3 space-y-2">
                {suggestedResults.map((item) => (
                  <Card
                    key={item.source}
                    className="border-slate-100 bg-white text-sm text-slate-700 shadow-inner"
                  >
                    <CardContent className="flex items-center justify-between px-3 py-2">
                      <span>{item.source}</span>
                      <span className="text-xs font-semibold text-primary">{item.count}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator className="my-4" />

          <Card className="border-slate-100 bg-white text-center shadow-sm">
            <CardContent className="px-3 py-3 text-xs text-slate-500">
              Thông tin được tạo ra bằng AI Tra Cứu Luật. Hãy sử dụng một cách có trách nhiệm.
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatPage;

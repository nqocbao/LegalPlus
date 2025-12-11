import { FormEvent, useMemo, useState } from "react";
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
  const { messages, addMessage } = useChatStore();

  const history = useMemo(() => {
    if (!messages.length) return [] as typeof messages;
    return messages.slice(-3);
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/chat/ask", { question: input });
      addMessage({
        id: res.data.chatId ?? crypto.randomUUID(),
        question: input,
        answer: res.data.answer,
        citations: res.data.citations,
        createdAt: new Date().toISOString(),
      });
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
            className="flex w-full items-center justify-between rounded-2xl border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-left text-slate-700 shadow-sm hover:border-primary/50 hover:bg-white"
          >
            <div className="flex items-center gap-2 font-medium">
              <MessageCircle className="h-5 w-5 text-primary" />
              Cuộc trò chuyện mới
            </div>
            <Badge className="bg-primary/10 text-primary">Mới</Badge>
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
          <ScrollArea className="max-h-[calc(100vh-320px)] pr-1">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <Card className="border-slate-100 bg-slate-50">
                  <CardContent className="p-4 text-slate-700">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Sparkles className="h-4 w-4" />
                      AI Luật
                    </div>
                    <p className="mt-2 leading-relaxed">
                      Xin chào! Bạn có thể hỏi tôi về các quyền và nghĩa vụ của một cá nhân theo luật pháp Việt Nam. Ví dụ: "Xe máy va chạm ô tô, ai bồi thường?".
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {messages.map((msg) => (
                <Card key={msg.id} className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                        BN
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase text-slate-500">Bạn</p>
                        <p className="mt-1 text-slate-900">{msg.question}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        AI
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
                          <Sparkles className="h-4 w-4" /> AI Luật
                        </div>
                        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-800">{msg.answer}</p>
                        {msg.citations?.length ? (
                          <Card className="mt-2 border-slate-200 bg-white">
                            <CardContent className="p-2 text-xs text-slate-600">
                              <p className="font-semibold text-primary">Trích dẫn</p>
                              <ul className="mt-1 list-disc space-y-1 pl-4">
                                {msg.citations.map((c) => (
                                  <li key={c.knowledgeId}>
                                    {c.title} {c.article ? `- ${c.article}` : ""}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ) : null}
                        <div className="mt-3 flex items-center gap-2 text-slate-400">
                          <ThumbsUp className="h-4 w-4" />
                          <ThumbsDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
          <Card className="border-slate-100 bg-slate-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Lịch sử trò chuyện</p>
                <Badge className="text-[11px]">Hiểu về bạn</Badge>
              </div>
              <div className="mt-2 space-y-2 text-sm text-slate-600">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có cuộc trò chuyện nào.</p>
                ) : (
                  history.map((msg) => (
                    <Card key={msg.id} className="bg-white">
                      <CardContent className="px-3 py-2">
                        <p className="truncate font-medium text-slate-800">{msg.question}</p>
                        <p className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  ))
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

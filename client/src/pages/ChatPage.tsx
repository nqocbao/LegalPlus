import { FormEvent, useState } from 'react';

import api from '../lib/api';
import { useChatStore } from '../store/chat';

function ChatPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { messages, addMessage } = useChatStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/chat/ask', { question: input });
      addMessage({
        id: res.data.chatId ?? crypto.randomUUID(),
        question: input,
        answer: res.data.answer,
        citations: res.data.citations,
        createdAt: new Date().toISOString(),
      });
      setInput('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
      <div className="rounded-2xl bg-white/5 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Đặt câu hỏi về bồi thường tai nạn giao thông"
            className="min-h-[120px] rounded-xl bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="self-end rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-600 disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Gửi câu hỏi'}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-xl bg-black/10 p-3">
              <p className="text-sm text-gray-300">Bạn: {msg.question}</p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">AI: {msg.answer}</p>
              {msg.citations?.length ? (
                <div className="mt-2 text-xs text-gray-300">
                  Trích dẫn:
                  <ul className="list-disc pl-4">
                    {msg.citations.map((c) => (
                      <li key={c.knowledgeId}>
                        {c.title} - {c.article ?? 'N/A'}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white/5 p-4 shadow-lg">
        <h3 className="text-lg font-semibold">Hướng dẫn nhanh</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-200">
          <li>Đặt câu hỏi cụ thể, ví dụ: "Xe máy va chạm ô tô, ai bồi thường?"</li>
          <li>AI sẽ trích dẫn điều luật liên quan và trả lời bằng tiếng Việt.</li>
          <li>Nếu không tìm thấy căn cứ phù hợp, AI sẽ thông báo rõ.</li>
        </ul>
      </div>
    </div>
  );
}

export default ChatPage;

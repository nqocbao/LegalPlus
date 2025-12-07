import { useEffect } from 'react';

import api from '../lib/api';
import { useChatStore } from '../store/chat';

function HistoryPage() {
  const { messages, setMessages } = useChatStore();

  useEffect(() => {
    api
      .get('/chat/history')
      .then((res) => setMessages(res.data))
      // eslint-disable-next-line no-console
      .catch((err) => console.error(err));
  }, [setMessages]);

  return (
    <div className="rounded-2xl bg-white/5 p-4 shadow-lg">
      <h2 className="text-lg font-semibold">Lịch sử hội thoại</h2>
      <div className="mt-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="rounded-xl bg-black/15 p-3">
            <p className="text-sm text-gray-300">{msg.createdAt}</p>
            <p className="mt-1 font-semibold">{msg.question}</p>
            <p className="mt-1 text-sm text-gray-100">{msg.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryPage;

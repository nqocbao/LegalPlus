import { FormEvent, useEffect, useState } from 'react';

import api from '../lib/api';

interface KnowledgeRow {
  id: string;
  title: string;
  article?: string;
  source?: string;
  content: string;
}

function KnowledgePage() {
  const [rows, setRows] = useState<KnowledgeRow[]>([]);
  const [title, setTitle] = useState('');
  const [article, setArticle] = useState('');
  const [source, setSource] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/knowledge').then((res) => setRows(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.post('/knowledge', { title, article, source, content });
    setTitle('');
    setArticle('');
    setSource('');
    setContent('');
    load();
    setLoading(false);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr,1fr]">
      <div className="rounded-2xl bg-white/5 p-4 shadow-lg">
        <h2 className="text-lg font-semibold">Danh sách kiến thức</h2>
        <div className="mt-3 space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl bg-black/15 p-3">
              <p className="text-sm text-gray-300">{row.source}</p>
              <p className="font-semibold">{row.title}</p>
              <p className="text-sm text-gray-200">{row.article}</p>
              <p className="mt-2 text-sm text-gray-100 line-clamp-3">{row.content}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white/5 p-4 shadow-lg">
        <h2 className="text-lg font-semibold">Thêm nội dung</h2>
        <form className="mt-3 space-y-3" onSubmit={handleCreate}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề"
            className="w-full rounded-xl bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            placeholder="Điều luật"
            className="w-full rounded-xl bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Nguồn"
            className="w-full rounded-xl bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung luật"
            className="min-h-[160px] w-full rounded-xl bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {loading ? 'Đang lưu...' : 'Lưu' }
          </button>
        </form>
      </div>
    </div>
  );
}

export default KnowledgePage;

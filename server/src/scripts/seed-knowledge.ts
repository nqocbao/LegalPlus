import 'dotenv/config';
import { DataSource } from 'typeorm';

import dataSource from '../database/data-source';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { chunkText } from '../utils/chunker';
import { RagService } from '../rag/rag.service';

const seedDocuments = [
  {
    title: 'Bộ luật Dân sự - Bồi thường thiệt hại',
    source: 'Bộ luật Dân sự 2015',
    article: 'Điều 584-592',
    content:
      'Điều 584. Căn cứ phát sinh trách nhiệm bồi thường thiệt hại...\nĐiều 585. Nguyên tắc bồi thường thiệt hại...\nĐiều 590. Thiệt hại do sức khỏe bị xâm phạm... (rút gọn để làm ví dụ seed).',
  },
  {
    title: 'Luật Giao thông đường bộ - Quy tắc chung',
    source: 'Luật Giao thông đường bộ 2008',
    article: 'Điều 8, 9, 13',
    content:
      'Điều 8. Các hành vi bị nghiêm cấm...\nĐiều 9. Quy tắc chung...\nĐiều 13. Tốc độ và khoảng cách giữa các xe (rút gọn để làm ví dụ seed).',
  },
];

async function bootstrap() {
  const ds: DataSource = await dataSource.initialize();
  const repo = ds.getRepository(Knowledge);
  const rag = new RagService(repo as any, { get: () => process.env.OPENAI_API_KEY } as any);

  for (const doc of seedDocuments) {
    const chunks = chunkText(doc.title, doc.content, doc.source, doc.article);
    for (const chunk of chunks) {
      const embedding = await rag.embed(chunk.content);
      const row = repo.create({ ...chunk, embedding });
      await repo.save(row);
      // eslint-disable-next-line no-console
      console.log(`Seeded chunk for ${doc.title}`);
    }
  }

  await ds.destroy();
  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Repository } from 'typeorm';

import { Knowledge } from '../knowledge/entities/knowledge.entity';

interface RetrievalResult {
  knowledge: Knowledge;
  promptContext: string;
}

@Injectable()
export class RagService {
  private readonly openai: OpenAI;
  private readonly vectorDimension: number;

  constructor(
    @InjectRepository(Knowledge) private readonly knowledgeRepo: Repository<Knowledge>,
    configService: ConfigService,
  ) {
    this.openai = new OpenAI({ apiKey: configService.get<string>('OPENAI_API_KEY') });
    this.vectorDimension = Number(configService.get<string>('VECTOR_DIMENSION') ?? 1536);
  }

  async embed(text: string): Promise<number[]> {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: this.vectorDimension,
    });
    return embedding.data[0]?.embedding ?? [];
  }

  async retrieve(query: string): Promise<RetrievalResult[]> {
    const queryVector = await this.embed(query);
    const rows = await this.knowledgeRepo.query(
      'SELECT * FROM knowledge ORDER BY embedding <-> $1 LIMIT 5',
      [queryVector],
    );
    return rows.map((row: Knowledge) => ({
      knowledge: row,
      promptContext: `Tiêu đề: ${row.title}\nNguồn: ${row.source ?? 'N/A'}\nĐiều luật: ${
        row.article ?? 'N/A'
      }\nNội dung: ${row.content}`,
    }));
  }

  async generateAnswer(question: string, contexts: RetrievalResult[]): Promise<string> {
    if (!contexts.length) {
      return 'Xin lỗi, tôi không tìm thấy căn cứ pháp lý phù hợp.';
    }

    const contextText = contexts
      .map((c, idx) => `#${idx + 1} ${c.promptContext}\n`)
      .join('\n');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Bạn là trợ lý pháp lý giao thông. Trả lời bằng tiếng Việt, trích dẫn điều luật cụ thể trong nội dung context. Nếu không có căn cứ, trả lời đúng mẫu yêu cầu.',
        },
        {
          role: 'user',
          content: `Câu hỏi: ${question}\n\nNgữ cảnh:\n${contextText}`,
        },
      ],
      temperature: 0.2,
    });

    return completion.choices[0]?.message?.content ?? 'Xin lỗi, tôi không tìm thấy căn cứ pháp lý phù hợp.';
  }
}

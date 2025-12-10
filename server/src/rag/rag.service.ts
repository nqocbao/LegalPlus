import { Injectable } from '@nestjs/common';
import { ConfigService } from 'libs/modules/config/config.service';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { RagHit } from 'libs/utils/enum';
import OpenAI from 'openai';

export interface RetrievalResult {
  articleId: number;
  sourceId: number;
  sourceName: string;
  sourceUrl: string | null;
  articleNumber: string;
  clauseNumber: string | null;
  title: string | null;
  chunkIndex: number | null;
  chunkText: string;
  score?: number;
  promptContext: string;
}

@Injectable()
export class RagService {
  private readonly openai: OpenAI;
  private readonly vectorDimension: number;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.vectorDimension = Number(
      this.configService.get<string>('VECTOR_DIMENSION') ?? 1536,
    );
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

    // Giả định law_embeddings có cột "embedding" kiểu vector
    const rows = await this.prismaService.$queryRawUnsafe<
      Array<{
        article_id: number;
        chunk_index: number | null;
        chunk_text: string;
        score: number;
        article_number: string;
        clause_number: string | null;
        title: string | null;
        source_id: number;
        source_name: string;
        source_url: string | null;
      }>
    >(
      `
      SELECT
        le.article_id,
        le.chunk_index,
        le.chunk_text,
        1 - (le.embedding <-> $1) AS score,
        la.article_number,
        la.clause_number,
        la.title,
        ls.id AS source_id,
        ls.name AS source_name,
        ls.source_url
      FROM law_embeddings le
      JOIN legal_articles la ON la.id = le.article_id
      JOIN legal_sources ls ON ls.id = la.source_id
      ORDER BY le.embedding <-> $1
      LIMIT 5
      `,
      queryVector,
    );

    return rows.map((row, idx) => {
      const lawRef = `Điều ${row.article_number}${row.clause_number ? `, Khoản ${row.clause_number}` : ''
        }`;
      const promptContext = [
        `Nguồn: ${row.source_name} (${row.source_url ?? 'N/A'})`,
        lawRef,
        row.title ? `Tiêu đề: ${row.title}` : null,
        `Đoạn trích: ${row.chunk_text}`,
      ]
        .filter(Boolean)
        .join('\n');

      return {
        articleId: row.article_id,
        sourceId: row.source_id,
        sourceName: row.source_name,
        sourceUrl: row.source_url,
        articleNumber: row.article_number,
        clauseNumber: row.clause_number,
        title: row.title,
        chunkIndex: row.chunk_index,
        chunkText: row.chunk_text,
        score: row.score,
        promptContext,
      };
    });
  }

  async generateAnswer(
    question: string,
    contexts: RetrievalResult[],
  ): Promise<string> {
    if (!contexts.length) {
      return 'Xin lỗi, tôi không tìm thấy căn cứ pháp lý phù hợp.';
    }

    const contextText = contexts
      .map(
        (c, idx) =>
          `#${idx + 1} [${c.sourceName}] Điều ${c.articleNumber}${c.clauseNumber ? `, Khoản ${c.clauseNumber}` : ''
          }\n${c.promptContext}\n`,
      )
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

    return (
      completion.choices[0]?.message?.content ??
      'Xin lỗi, tôi không tìm thấy căn cứ pháp lý phù hợp.'
    );
  }

  /**
   * RAG retrieval đơn giản: dùng ILIKE trên chunk_text.
   * Sau này có thể thay bằng vector search (pgvector / external vector DB).
   */
  async retrieveContext(
    rawQuery: string,
    legalDomain?: string,
    limit = 10,
  ): Promise<RagHit[]> {
    if (!rawQuery?.trim()) return [];

    const embeddings = await this.prismaService.lawEmbedding.findMany({
      where: {
        chunkText: {
          contains: rawQuery,
          mode: 'insensitive',
        },
        article: legalDomain
          ? {
            source: {
              legalDomain,
              deletedAt: null,
            },
          }
          : {
            source: {
              deletedAt: null,
            },
          },
      },
      take: limit,
      include: {
        article: {
          include: {
            source: true,
          },
        },
      },
    });

    // Giả lập score đơn giản = độ dài overlap (có thể thay bằng logic riêng)
    const hits: RagHit[] = embeddings.map((e) => ({
      articleId: e.articleId,
      chunkIndex: e.chunkIndex,
      score: 1, // placeholder
      articleTitle: e.article.title,
      articleNumber: e.article.articleNumber,
      clauseNumber: e.article.clauseNumber,
      chunkText: e.chunkText,
    }));

    return hits;
  }
}

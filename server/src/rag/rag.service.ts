import { Injectable } from '@nestjs/common';
import { ConfigService } from 'libs/modules/config/config.service';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { RagHit } from 'libs/utils/enum';
import axios from 'axios';


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
  private readonly vectorDimension: number;
  private readonly localModelUrl: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.vectorDimension = Number(
      this.configService.get<string>('VECTOR_DIMENSION') ?? 1536,
    );
    this.localModelUrl =
      this.configService.get<string>('LOCAL_MODEL_URL') ??
      'http://localhost:8000/generate';
  }

  // async embed(text: string): Promise<number[]> {
  //   const embedding = await this.openai.embeddings.create({
  //     model: 'text-embedding-3-small',
  //     input: text,
  //     dimensions: this.vectorDimension,
  //   });
  //   return embedding.data[0]?.embedding ?? [];
  // }

  async retrieve(query: string): Promise<RetrievalResult[]> {
    const rows = await this.prismaService.lawEmbedding.findMany({
      where: {
        chunkText: {
          contains: query,
          mode: 'insensitive',
        },
        article: {
          source: {
            deletedAt: null,
          },
        },
      },
      take: 5,
      include: {
        article: {
          include: {
            source: true,
          },
        },
      },
    });

    return rows.map((e) => {
      const lawRef = `Điều ${e.article.articleNumber}${e.article.clauseNumber ? `, Khoản ${e.article.clauseNumber}` : ''
        }`;

      const promptContext = [
        `Nguồn: ${e.article.source.name} (${e.article.source.sourceUrl ?? 'N/A'})`,
        lawRef,
        e.article.title ? `Tiêu đề: ${e.article.title}` : null,
        `Đoạn trích: ${e.chunkText}`,
      ]
        .filter(Boolean)
        .join('\n');

      return {
        articleId: e.articleId,
        sourceId: e.article.sourceId,
        sourceName: e.article.source.name,
        sourceUrl: e.article.source.sourceUrl,
        articleNumber: e.article.articleNumber,
        clauseNumber: e.article.clauseNumber,
        title: e.article.title,
        chunkIndex: e.chunkIndex,
        chunkText: e.chunkText,
        score: 1,
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
            `#${idx + 1} [${c.sourceName}] Điều ${c.articleNumber}${
              c.clauseNumber ? `, Khoản ${c.clauseNumber}` : ''
            }\n${c.promptContext}\n`,
        )
        .join('\n');

      try {
        const resp = await axios.post<{
          answer: string;
        }>(this.localModelUrl, {
          question,
          context: contextText,
        });

        const answer = resp.data?.answer?.trim();
        if (!answer) {
          return 'Xin lỗi, tôi không tìm thấy căn cứ pháp lý phù hợp.';
        }
        return answer;
      } catch (e) {
        // Có thể log chi tiết hơn
        return 'Xin lỗi, đã xảy ra lỗi khi gọi mô hình tư vấn pháp lý.';
      }
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

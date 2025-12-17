import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { RagService } from 'src/rag/rag.service';
import { SenderType, SendMessageDto } from '../dto/send-message.dto';
import { GetMessagesDto } from '../dto/get-all-messages.dto';
import { assignPaging, returnPaging } from 'libs/utils/helpers';

@Injectable()
export class MessageService {
  private readonly modelServiceUrl = process.env.MODEL_SERVICE_URL || 'http://localhost:8000';

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
  ) { }

  async getMessagesByConversation(conversationId: number, query: GetMessagesDto) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, deletedAt: null },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const paging = assignPaging(query);

    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId, deletedAt: null },
        orderBy: { createdAt: 'asc' },
        skip: paging.skip,
        take: paging.pageSize,
      }),
      this.prisma.message.count({
        where: { conversationId, deletedAt: null },
      }),
    ]);

    return returnPaging(items, total, paging);
  }

  /**
   * FULL PIPELINE:
   * 1. Lưu USER message
   * 2. Retrieve RAG context (vector search hoặc text search)
   * 3. Log QueryLog
   * 4. Generate assistant reply bằng OpenAI
   * 5. Lưu ASSISTANT message
   * 6. Trả lại full kết quả
   */
  async createMessage(conversationId: number, dto: SendMessageDto) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, deletedAt: null },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const userMessage = await this.prisma.message.create({
      data: {
        conversationId,
        senderType: dto.senderType,
        senderId: dto.senderId ?? null,
        content: dto.content,
        isUserVisible: dto.isUserVisible ?? true,
        metadata: dto.metadata ?? undefined,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: userMessage.createdAt },
    });

    let ragContexts = [];
    if (dto.senderType === SenderType.USER && dto.withRagContext) {
      ragContexts = await this.ragService.retrieveContext(
        dto.content,
        conversation.legalDomain ?? undefined,
      );
    }

    const queryLog = await this.prisma.queryLog.create({
      data: {
        conversationId,
        messageId: userMessage.id,
        rawQueryText: dto.content,
        userId: dto.senderId ?? null,
        intent: 'LEGAL_QUERY',
        intentMeta: {
          legalDomain: conversation.legalDomain,
          ragHits: ragContexts.map((hit) => ({
            articleId: hit.articleId,
            chunkIndex: hit.chunkIndex,
            score: hit.score,
          })),
        },
        successFlag: ragContexts.length > 0,
      },
    });

    const prompt = this.buildPrompt(dto.content, ragContexts);

    let aiReply = 'Không thể kết nối đến model AI';

    try {
      const contextText = ragContexts.map(c => 
        `Điều ${c.articleNumber}${c.clauseNumber ? ', Khoản ' + c.clauseNumber : ''}: ${c.chunkText}`
      ).join('\n\n');

      const response = await fetch(`${this.modelServiceUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: dto.content,
          context: contextText
        })
      });

      if (response.ok) {
        const data = await response.json();
        aiReply = data.answer || 'Model không trả về câu trả lời';
      } else {
        aiReply = `Lỗi kết nối model (${response.status})`;
      }
    } catch (error) {
      aiReply = `Không thể kết nối đến model AI: ${error.message}`;
    }

    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId,
        senderType: SenderType.ASSISTANT,
        content: aiReply,
        isUserVisible: true,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: assistantMessage.createdAt },
    });

    return {
      userMessage,
      ragContexts,
      queryLog,
      assistantMessage,
    };
  }

  /** FORMAT PROMPT RAG STYLE */
  private buildPrompt(question: string, contexts: any[]) {
    if (!contexts.length) {
      return `
Câu hỏi: ${question}
Hiện tại không tìm thấy căn cứ pháp lý phù hợp. 
Vui lòng trả lời theo hiểu biết thông thường của pháp luật Việt Nam nhưng KHÔNG trích dẫn sai luật.
      `.trim();
    }

    const lawContext = contexts
      .map(
        (c, idx) =>
          `(${idx + 1}) Điều ${c.articleNumber}${c.clauseNumber ? ', Khoản ' + c.clauseNumber : ''
          }: ${c.chunkText}`,
      )
      .join('\n\n');

    return `
Câu hỏi: ${question}

Dưới đây là các căn cứ pháp lý liên quan:
${lawContext}

Vui lòng:
- Trả lời bằng tiếng Việt
- Diễn giải dễ hiểu
- Trích dẫn đầy đủ điều luật
- Không bịa nội dung không có trong context
    `.trim();
  }

  async addMessageFeedback(messageId: number, userId: number, rating?: number, comment?: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const feedback = await this.prisma.messageFeedback.create({
      data: {
        messageId,
        userId,
        rating: rating ?? null,
        comment: comment ?? null,
      },
    });

    return feedback;
  }
}

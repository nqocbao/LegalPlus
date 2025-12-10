import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { RagService } from 'src/rag/rag.service';
import { GetMessagesDto } from '../dto/get-all-messages.dto';
import { SenderType, SendMessageDto } from '../dto/send-message.dto';
import { assignPaging, returnPaging } from 'libs/utils/helpers';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
  ) { }

  async getMessagesByConversation(
    conversationId: number,
    query: GetMessagesDto,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, deletedAt: null },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const paging = assignPaging(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: {
          conversationId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: paging.skip,
        take: paging.pageSize,
      }),
      this.prisma.message.count({
        where: {
          conversationId,
          deletedAt: null,
        },
      }),
    ]);

    return returnPaging(items, total, paging);
  }

  /**
   * Tạo message mới trong conversation. Nếu là USER và withRagContext=true,
   * sẽ:
   *  - gọi RagService để lấy context
   *  - log QueryLog
   *  - trả thêm ragContext & queryLog trong response
   *
   * Việc gọi OpenAI / LLM để generate assistant reply bạn có thể implement
   * ở tầng khác (ChatService / use case) dựa trên ragContext.
   */
  async createMessage(
    conversationId: number,
    dto: SendMessageDto,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, deletedAt: null },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderType: dto.senderType,
        senderId: dto.senderId ?? null,
        content: dto.content,
        isUserVisible: dto.isUserVisible ?? true,
        metadata: dto.metadata ?? undefined,
      },
    });

    // Update lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: message.createdAt,
      },
    });

    let ragContext: any[] = [];
    let queryLog: any = null;

    if (dto.senderType === SenderType.USER && dto.withRagContext) {
      // RAG retrieval
      ragContext = await this.ragService.retrieveContext(
        dto.content,
        conversation.legalDomain ?? undefined,
      );

      // QueryLog
      queryLog = await this.prisma.queryLog.create({
        data: {
          conversationId: conversation.id,
          messageId: message.id,
          userId: conversation.userId ?? dto.senderId ?? null,
          rawQueryText: dto.content,
          intent: 'LEGAL_QUERY',
          intentMeta: {
            legalDomain: conversation.legalDomain,
            ragHits: ragContext.map((hit) => ({
              articleId: hit.articleId,
              chunkIndex: hit.chunkIndex,
              score: hit.score,
            })),
          },
          successFlag: ragContext.length > 0,
        },
      });
    }

    return {
      message,
      ragContext,
      queryLog,
    };
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

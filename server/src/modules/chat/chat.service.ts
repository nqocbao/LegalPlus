// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { ChatRequestDto } from './dto/chat-request.dto';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { RagService } from 'src/rag/rag.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly ragService: RagService,
  ) { }

  async ask(dto: ChatRequestDto, userId?: number) {
    // 1. RAG retrieve từ luật
    const retrieval = await this.ragService.retrieve(dto.question);

    // 2. Generate answer từ FastAPI của local model
    const answer = await this.ragService.generateAnswer(dto.question, retrieval);
    

    // 3. Tạo conversation
    const conversation = await this.prismaService.conversation.create({
      data: {
        userId: userId ?? null,
        title: dto.question.slice(0, 100),
        status: 'OPEN',
        legalDomain: null,
      },
    });

    // 4. Tạo message user
    const userMessage = await this.prismaService.message.create({
      data: {
        conversationId: conversation.id,
        senderType: 'USER',
        senderId: userId ?? null,
        content: dto.question,
        isUserVisible: true,
      },
    });

    // 5. Tạo message assistant
    const assistantMessage = await this.prismaService.message.create({
      data: {
        conversationId: conversation.id,
        senderType: 'ASSISTANT',
        senderId: null,
        content: answer,
        isUserVisible: true,
      },
    });

    // 6. Lưu citations cho câu trả lời
    if (retrieval.length > 0) {
      await this.prismaService.messageCitation.createMany({
        data: retrieval.map((r, index) => ({
          messageId: assistantMessage.id,
          articleId: r.articleId,
          chunkIndex: r.chunkIndex ?? null,
          rank: index + 1,
          score: r.score ?? null,
        })),
      });
    }

    // 7. Chuẩn hóa citations trả về FE
    const citations = retrieval.map((r, index) => ({
      articleId: r.articleId,
      sourceId: r.sourceId,
      sourceName: r.sourceName,
      sourceUrl: r.sourceUrl,
      articleNumber: r.articleNumber,
      clauseNumber: r.clauseNumber,
      title: r.title,
      chunkIndex: r.chunkIndex,
      rank: index + 1,
      score: r.score,
    }));

    return {
      answer,
      citations,
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
    };
  }

  async history(userId?: number) {
    if (!userId) {
      // Lịch sử chung (khách ẩn danh): 20 conversation mới nhất
      return this.prismaService.conversation.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          messages: {
            where: { isUserVisible: true, deletedAt: null },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    // Lịch sử theo userId
    return this.prismaService.conversation.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        messages: {
          where: { isUserVisible: true, deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { GetAllConversationsDto } from '../dto/get-all-conversations.dto';
import { assignPaging, returnPaging } from 'libs/utils/helpers';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) { }

  async createConversation(dto: CreateConversationDto) {
    const now = new Date();

    const conversation = await this.prisma.conversation.create({
      data: {
        userId: dto.userId ?? null,
        legalDomain: dto.legalDomain ?? null,
        title: dto.title ?? null,
        status: 'OPEN',
        startedAt: now,
        lastMessageAt: now,
      },
    });

    // Nếu có initialMessage thì tạo luôn Message đầu tiên
    if (dto.initialMessage) {
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderType: 'USER',
          senderId: dto.userId ?? null,
          content: dto.initialMessage,
          isUserVisible: true,
        },
      });
    }

    return conversation;
  }

  async getConversationById(id: number) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async listConversations(query: GetAllConversationsDto) {
    const paging = assignPaging(query);

    const where: any = {
      deletedAt: null,
    };

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.legalDomain) {
      where.legalDomain = query.legalDomain;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        where,
        orderBy: {
          lastMessageAt: 'desc',
        },
        skip: paging.skip,
        take: paging.pageSize,
        include: {
          user: true,
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return returnPaging(items, total, paging);
  }

  async closeConversation(id: number) {
    const existing = await this.prisma.conversation.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Conversation not found');
    }

    const now = new Date();

    return this.prisma.conversation.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: now,
        updatedAt: now,
      },
    });
  }
}

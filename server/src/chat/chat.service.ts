import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RagService } from '../rag/rag.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { Chat, ChatCitation } from './entities/chat.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(Knowledge) private readonly knowledgeRepo: Repository<Knowledge>,
    private readonly ragService: RagService,
  ) {}

  async ask(dto: ChatRequestDto, userId?: string) {
    const retrieval = await this.ragService.retrieve(dto.question);
    const answer = await this.ragService.generateAnswer(dto.question, retrieval);
    const citations: ChatCitation[] = retrieval.map((r) => ({
      knowledgeId: r.knowledge.id,
      title: r.knowledge.title,
      article: r.knowledge.article,
    }));

    const chat = this.chatRepo.create({ question: dto.question, answer, citations });
    if (userId) {
      chat.user = { id: userId } as any;
    }
    await this.chatRepo.save(chat);

    return { answer, citations, chatId: chat.id };
  }

  history(userId?: string) {
    if (!userId) {
      return this.chatRepo.find({ order: { createdAt: 'DESC' }, take: 20 });
    }
    return this.chatRepo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }
}

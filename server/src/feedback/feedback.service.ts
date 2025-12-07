import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Chat } from '../chat/entities/chat.entity';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback) private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
  ) {}

  async create(dto: CreateFeedbackDto, userId?: string) {
    const chat = await this.chatRepo.findOne({ where: { id: dto.chatId } });
    if (!chat) throw new NotFoundException('Chat not found');

    const feedback = this.feedbackRepo.create({
      chat,
      rating: dto.rating,
      comment: dto.comment,
    });
    if (userId) {
      feedback.user = { id: userId } as any;
    }
    return this.feedbackRepo.save(feedback);
  }

  findAll() {
    return this.feedbackRepo.find({ relations: ['chat'], order: { createdAt: 'DESC' } });
  }
}

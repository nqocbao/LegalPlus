import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Knowledge]), RagModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

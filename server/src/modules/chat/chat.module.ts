import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller';
import { RagModule } from 'src/rag/rag.module';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';

@Module({
  imports: [RagModule],
  controllers: [ChatController],
  providers: [ConversationService, MessageService],
})
export class ChatModule { }

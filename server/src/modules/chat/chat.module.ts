import { Module } from '@nestjs/common';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { RagModule } from 'src/rag/rag.module';

@Module({
  imports: [RagModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule { }

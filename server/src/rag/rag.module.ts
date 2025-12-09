import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { ConfigModule } from 'libs/modules/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule { }

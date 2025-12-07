import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { RagService } from './rag.service';

@Module({
  imports: [TypeOrmModule.forFeature([Knowledge])],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}

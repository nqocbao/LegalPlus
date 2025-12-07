import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Knowledge } from './entities/knowledge.entity';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { RagService } from '../rag/rag.service';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(Knowledge) private readonly repo: Repository<Knowledge>,
    private readonly ragService: RagService,
  ) {}

  async create(dto: CreateKnowledgeDto) {
    const embedding = dto.embedding ?? (await this.ragService.embed(dto.content));
    const knowledge = this.repo.create({ ...dto, embedding });
    return this.repo.save(knowledge);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Knowledge not found');
    return item;
  }

  async update(id: string, dto: UpdateKnowledgeDto) {
    const item = await this.findOne(id);
    const embedding = dto.content ? await this.ragService.embed(dto.content) : dto.embedding;
    const updated = this.repo.merge(item, { ...dto, embedding: embedding ?? item.embedding });
    return this.repo.save(updated);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.delete(item.id);
    return { deleted: true };
  }
}

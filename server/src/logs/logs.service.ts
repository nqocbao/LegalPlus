import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminLog } from './entities/admin-log.entity';

@Injectable()
export class LogsService {
  constructor(@InjectRepository(AdminLog) private readonly repo: Repository<AdminLog>) {}

  async log(action: string, metadata?: Record<string, unknown>, actorId?: string) {
    const entry = this.repo.create({ action, metadata });
    if (actorId) entry.actor = { id: actorId } as any;
    return this.repo.save(entry);
  }
}

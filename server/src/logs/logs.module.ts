import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminLog } from './entities/admin-log.entity';
import { LogsService } from './logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminLog])],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}

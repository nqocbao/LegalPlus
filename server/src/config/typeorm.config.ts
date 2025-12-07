import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { AdminLog } from '../logs/entities/admin-log.entity';
import { Chat } from '../chat/entities/chat.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { User } from '../auth/entities/user.entity';

const typeormConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') ?? 'localhost',
  port: Number(configService.get<string>('DB_PORT') ?? 5432),
  username: configService.get<string>('DB_USER') ?? 'postgres',
  password: configService.get<string>('DB_PASSWORD') ?? 'postgres',
  database: configService.get<string>('DB_NAME') ?? 'legalplus',
  entities: [User, Knowledge, Chat, Feedback, AdminLog],
  synchronize: false,
  migrationsRun: false,
  logging: configService.get<string>('DB_LOGGING') === 'true',
});

export default typeormConfig;

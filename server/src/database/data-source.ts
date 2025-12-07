import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Chat } from '../chat/entities/chat.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { AdminLog } from '../logs/entities/admin-log.entity';
import { Init1700000000000 } from './migrations/1700000000000-init';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'legalplus',
  entities: [User, Knowledge, Chat, Feedback, AdminLog],
  migrations: [Init1700000000000],
  logging: false,
});

export default dataSource;

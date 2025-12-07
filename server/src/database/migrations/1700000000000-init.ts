import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        email varchar(255) UNIQUE NOT NULL,
        "passwordHash" varchar(255) NOT NULL,
        role varchar(10) NOT NULL DEFAULT 'user',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS knowledge (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title varchar(255) NOT NULL,
        source varchar(255),
        article varchar(255),
        content text NOT NULL,
        embedding vector(1536),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid REFERENCES users(id),
        question text NOT NULL,
        answer text NOT NULL,
        citations jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "chatId" uuid REFERENCES chats(id) ON DELETE CASCADE,
        "userId" uuid REFERENCES users(id),
        rating int NOT NULL DEFAULT 5,
        comment text,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "actorId" uuid REFERENCES users(id),
        action varchar(255) NOT NULL,
        metadata jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_knowledge_embedding ON knowledge USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS admin_logs');
    await queryRunner.query('DROP TABLE IF EXISTS feedback');
    await queryRunner.query('DROP TABLE IF EXISTS chats');
    await queryRunner.query('DROP TABLE IF EXISTS knowledge');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../auth/entities/user.entity';

export interface ChatCitation {
  knowledgeId: string;
  title: string;
  article?: string;
}

@Entity({ name: 'chats' })
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.chats, { nullable: true })
  user?: User;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'text' })
  answer!: string;

  @Column({ type: 'jsonb', nullable: true })
  citations?: ChatCitation[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

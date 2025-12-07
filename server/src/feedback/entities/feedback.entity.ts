import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Chat } from '../../chat/entities/chat.entity';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'feedback' })
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Chat, { nullable: false })
  chat!: Chat;

  @ManyToOne(() => User, (user) => user.feedbacks, { nullable: true })
  user?: User;

  @Column({ type: 'int', default: 5 })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

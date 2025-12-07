import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'knowledge' })
export class Knowledge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255, nullable: true })
  source?: string;

  @Column({ length: 255, nullable: true })
  article?: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'vector',
    nullable: true,
    transformer: {
      to: (value?: number[]) => value,
      from: (value?: number[]) => value,
    },
  })
  embedding?: number[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @Column()
  title: string;

  @Column()
  basename: string;

  @Column({
    type: 'enum',
    enum: ['Publish', 'Draft'],
    default: 'Draft',
  })
  status: 'Publish' | 'Draft';

  @Column({ default: true })
  allowComments: boolean;

  @Column({ default: false })
  convertBreaks: boolean;

  @Column({ type: 'timestamp' })
  publishedAt: Date;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'text', nullable: true })
  extendedBody: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
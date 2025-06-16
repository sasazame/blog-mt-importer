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

  @Column('varchar')
  author: string;

  @Column('varchar')
  title: string;

  @Column('varchar')
  basename: string;

  @Column({
    type: 'enum',
    enum: ['Publish', 'Draft'],
    default: 'Draft',
  })
  status: 'Publish' | 'Draft';

  @Column('boolean', { default: true })
  allowComments: boolean;

  @Column('boolean', { default: false })
  convertBreaks: boolean;

  @Column({ type: 'timestamp' })
  publishedAt: Date;

  @Column('varchar', { nullable: true })
  category: string;

  @Column('varchar', { nullable: true })
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
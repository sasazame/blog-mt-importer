import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { RssFeed } from './rss-feed.entity';
import { BlogPost } from '../../blog/entities/blog-post.entity';

@Entity('rss_import_logs')
@Index(['feedId', 'guid'], { unique: true })
export class RssImportLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RssFeed)
  feed: RssFeed;

  @Column()
  feedId: number;

  @Column()
  guid: string; // RSS item GUID or link as unique identifier

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'timestamp' })
  publishedAt: Date;

  @ManyToOne(() => BlogPost, { nullable: true })
  blogPost: BlogPost;

  @Column({ nullable: true })
  blogPostId: number;

  @CreateDateColumn()
  importedAt: Date;
}
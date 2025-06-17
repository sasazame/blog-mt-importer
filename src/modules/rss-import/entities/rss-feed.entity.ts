import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('rss_feeds')
export class RssFeed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  mapping: {
    title?: string;
    body?: string;
    date?: string;
    author?: string;
    link?: string;
    tags?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'int', default: 0 })
  importedCount: number;

  @Column({ type: 'json', nullable: true })
  lastError: {
    message: string;
    timestamp: Date;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
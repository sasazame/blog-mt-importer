import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryFailedError } from 'typeorm';
import { RssFeed } from '../entities/rss-feed.entity';
import { RssImportLog } from '../entities/rss-import-log.entity';
import { BlogPost } from '../../blog/entities/blog-post.entity';
import { BlogService } from '../../blog/services/blog.service';
import { RssParserService, ParsedRssItem } from './rss-parser.service';
import { ContentFetcherService } from './content-fetcher.service';
import * as cron from 'node-cron';

@Injectable()
export class RssImportService {
  private readonly logger = new Logger(RssImportService.name);
  private scheduledTasks: Map<number, cron.ScheduledTask> = new Map();

  constructor(
    @InjectRepository(RssFeed)
    private rssFeedRepository: Repository<RssFeed>,
    @InjectRepository(RssImportLog)
    private importLogRepository: Repository<RssImportLog>,
    private blogService: BlogService,
    private rssParserService: RssParserService,
    private contentFetcherService: ContentFetcherService,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Load and schedule all enabled feeds
    const feeds = await this.rssFeedRepository.find({ where: { enabled: true } });
    for (const feed of feeds) {
      await this.scheduleFeed(feed);
    }
  }

  async onModuleDestroy() {
    // Stop all scheduled tasks
    for (const task of this.scheduledTasks.values()) {
      task.stop();
    }
  }

  async createFeed(data: Partial<RssFeed>): Promise<RssFeed> {
    const feed = this.rssFeedRepository.create(data);
    const savedFeed = await this.rssFeedRepository.save(feed);
    
    if (savedFeed.enabled) {
      await this.scheduleFeed(savedFeed);
    }
    
    return savedFeed;
  }

  async updateFeed(id: number, data: Partial<RssFeed>): Promise<RssFeed> {
    await this.rssFeedRepository.update(id, data);
    const feed = await this.rssFeedRepository.findOne({ where: { id } });
    
    if (!feed) {
      throw new Error(`Feed ${id} not found`);
    }

    // Update scheduling
    this.unscheduleFeed(id);
    if (feed.enabled) {
      await this.scheduleFeed(feed);
    }
    
    return feed;
  }

  async deleteFeed(id: number): Promise<void> {
    this.unscheduleFeed(id);
    await this.rssFeedRepository.delete(id);
  }

  async getAllFeeds(): Promise<RssFeed[]> {
    return this.rssFeedRepository.find();
  }

  async importFeed(feedId: number): Promise<{ imported: number; skipped: number; errors: number }> {
    const feed = await this.rssFeedRepository.findOne({ where: { id: feedId } });
    if (!feed) {
      throw new Error(`Feed ${feedId} not found`);
    }

    this.logger.log(`Starting import for feed: ${feed.name}`);
    const startTime = new Date();
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    try {
      const items = await this.rssParserService.parseFeed(feed);
      this.logger.log(`Parsed ${items.length} items from ${feed.name}`);

      for (const item of items) {
        try {
          const result = await this.importItem(feed, item);
          if (result === 'imported') {
            imported++;
          } else if (result === 'skipped') {
            skipped++;
          }
        } catch (error) {
          errors++;
          this.logger.error(`Failed to import item "${item.title}":`, error);
        }
      }

      // Update feed status
      await this.rssFeedRepository.update(feed.id, {
        lastSyncAt: startTime,
        importedCount: feed.importedCount + imported,
        lastError: undefined,
      });

      this.logger.log(`Import completed for ${feed.name}: imported=${imported}, skipped=${skipped}, errors=${errors}`);
    } catch (error) {
      this.logger.error(`Import failed for ${feed.name}:`, error);
      await this.rssFeedRepository.update(feed.id, {
        lastError: {
          message: error.message || 'Unknown error',
          timestamp: new Date(),
        },
      });
      throw error;
    }

    return { imported, skipped, errors };
  }

  async importAllFeeds(): Promise<{ feedId: number; name: string; result: any }[]> {
    const feeds = await this.rssFeedRepository.find({ where: { enabled: true } });
    const results = [];

    for (const feed of feeds) {
      try {
        const result = await this.importFeed(feed.id);
        results.push({
          feedId: feed.id,
          name: feed.name,
          result,
        });
      } catch (error) {
        results.push({
          feedId: feed.id,
          name: feed.name,
          result: { error: error.message },
        });
      }
    }

    return results;
  }

  private async importItem(feed: RssFeed, item: ParsedRssItem): Promise<'imported' | 'skipped'> {
    // Check if already imported
    const existing = await this.importLogRepository.findOne({
      where: {
        feedId: feed.id,
        guid: item.guid,
      },
    });

    if (existing) {
      this.logger.debug(`Item already imported: ${item.title}`);
      return 'skipped';
    }

    // Import as blog post
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch full content and split it properly
      let body = item.body;
      let extendedBody: string | undefined;
      
      if (item.link) {
        try {
          const fullContent = await this.contentFetcherService.fetchFullContent(item.link);
          
          if (fullContent) {
            // Try to split the content based on RSS body
            const splitResult = this.contentFetcherService.splitContentByRssBody(
              fullContent.body,
              item.body
            );
            
            body = splitResult.body;
            extendedBody = splitResult.extendedBody;
            
            this.logger.debug(`Content split for ${item.title}: body=${body.length} chars, extended=${extendedBody?.length || 0} chars`);
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch content for ${item.title}:`, error.message);
          // Fall back to RSS content
        }
      }

      // Create blog post with improved data mapping
      const blogPost = await this.blogService.create({
        title: item.title,
        body: body,
        extendedBody: extendedBody,
        status: 'Publish',
        author: item.author || feed.name,
        category: item.category || feed.category || 'RSS Import',
        publishedAt: item.date,
        basename: item.basename || this.generateBasename(item.title, item.date),
      });

      // Create import log
      const importLog = this.importLogRepository.create({
        feed,
        feedId: feed.id,
        guid: item.guid,
        title: item.title,
        publishedAt: item.date,
        blogPost,
        blogPostId: blogPost.id,
      });

      await queryRunner.manager.save(importLog);
      await queryRunner.commitTransaction();

      this.logger.log(`Imported: ${item.title}`);
      return 'imported';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      // Check if it's a duplicate key error
      if (error instanceof QueryFailedError && error.message.includes('Duplicate entry')) {
        this.logger.debug(`Duplicate detected during import: ${item.title}`);
        return 'skipped';
      }
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async scheduleFeed(feed: RssFeed): Promise<void> {
    // Default schedule: every hour
    const schedule = '0 * * * *';
    
    const task = cron.schedule(schedule, async () => {
      this.logger.log(`Running scheduled import for ${feed.name}`);
      try {
        await this.importFeed(feed.id);
      } catch (error) {
        this.logger.error(`Scheduled import failed for ${feed.name}:`, error);
      }
    });

    this.scheduledTasks.set(feed.id, task);
    this.logger.log(`Scheduled feed ${feed.name} with cron: ${schedule}`);
  }

  private unscheduleFeed(feedId: number): void {
    const task = this.scheduledTasks.get(feedId);
    if (task) {
      task.stop();
      this.scheduledTasks.delete(feedId);
      this.logger.log(`Unscheduled feed ${feedId}`);
    }
  }

  private generateBasename(title: string, date: Date): string {
    // Generate a slug-like basename from title and date
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const titleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
    
    return `${dateStr}-${titleSlug}`;
  }
}
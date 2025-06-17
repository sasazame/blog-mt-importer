import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from '../../blog/entities/blog-post.entity';
import { GeminiService } from './gemini.service';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    private readonly geminiService: GeminiService,
  ) {}

  async generateSummariesForRange(startId: number, endId: number, delay = 1000, onlyUnprocessed = false): Promise<void> {
    this.logger.log(`Starting summary generation for articles ${startId}-${endId} (onlyUnprocessed: ${onlyUnprocessed})`);

    const queryBuilder = this.blogPostRepository
      .createQueryBuilder('post')
      .where('post.id >= :startId AND post.id <= :endId', { startId, endId });

    // Filter for unprocessed posts if requested
    if (onlyUnprocessed) {
      queryBuilder.andWhere('(post.summary IS NULL OR post.summary = \'\' OR post.recommendationStars IS NULL)');
    }

    const posts = await queryBuilder
      .orderBy('post.id', 'ASC')
      .getMany();

    this.logger.log(`Found ${posts.length} posts to process`);

    if (posts.length === 0) {
      this.logger.log('No posts to process');
      return;
    }

    for (const [index, post] of posts.entries()) {
      try {
        this.logger.log(`Processing post ${post.id}: ${post.title} (${index + 1}/${posts.length})`);

        const result = await this.geminiService.generateSummaryAndRating(
          post.title,
          post.body,
          post.category,
          post.publishedAt.toISOString(),
        );

        // Update the post with summary and rating
        await this.blogPostRepository.update(post.id, {
          summary: result.summary,
          recommendationStars: result.recommendation_stars,
        });

        this.logger.log(
          `Updated post ${post.id} with summary (${result.summary.length} chars) and rating ${result.recommendation_stars}`,
        );

        // Add delay to avoid rate limiting
        if (index < posts.length - 1) {
          await this.geminiService.delay(delay);
        }
      } catch (error) {
        this.logger.error(`Failed to process post ${post.id}: ${post.title}`, error);
        
        // Check if it's a rate limit error and stop processing
        if (error.message?.includes('Rate limit exceeded')) {
          this.logger.error('Rate limit exceeded. Stopping batch processing.');
          throw error; // Re-throw to stop the entire process
        }
        
        // For other errors, continue with next post
        continue;
      }
    }

    this.logger.log(`Completed summary generation for articles ${startId}-${endId}`);
  }

  async generateSummariesForAll(batchSize = 10, delay = 1000, onlyUnprocessed = false): Promise<void> {
    this.logger.log(`Starting summary generation for all posts (onlyUnprocessed: ${onlyUnprocessed})`);

    const queryBuilder = this.blogPostRepository.createQueryBuilder('post');
    
    if (onlyUnprocessed) {
      queryBuilder.where('(post.summary IS NULL OR post.summary = \'\' OR post.recommendationStars IS NULL)');
    }

    const totalCount = await queryBuilder.getCount();
    this.logger.log(`Total posts to process: ${totalCount}`);

    if (totalCount === 0) {
      this.logger.log('No posts to process');
      return;
    }

    for (let offset = 0; offset < totalCount; offset += batchSize) {
      const batchQueryBuilder = this.blogPostRepository.createQueryBuilder('post');
      
      if (onlyUnprocessed) {
        batchQueryBuilder.where('(post.summary IS NULL OR post.summary = \'\' OR post.recommendationStars IS NULL)');
      }

      const posts = await batchQueryBuilder
        .orderBy('post.id', 'ASC')
        .skip(offset)
        .take(batchSize)
        .getMany();

      this.logger.log(`Processing batch ${Math.floor(offset / batchSize) + 1} (${posts.length} posts)`);

      for (const [index, post] of posts.entries()) {
        try {
          this.logger.log(`Processing post ${post.id}: ${post.title}`);

          const result = await this.geminiService.generateSummaryAndRating(
            post.title,
            post.body,
            post.category,
            post.publishedAt.toISOString(),
          );

          await this.blogPostRepository.update(post.id, {
            summary: result.summary,
            recommendationStars: result.recommendation_stars,
          });

          this.logger.log(
            `Updated post ${post.id} with summary and rating ${result.recommendation_stars}`,
          );

          // Add delay between API calls
          if (index < posts.length - 1 || offset + batchSize < totalCount) {
            await this.geminiService.delay(delay);
          }
        } catch (error) {
          this.logger.error(`Failed to process post ${post.id}: ${post.title}`, error);
          
          // Check if it's a rate limit error and stop processing
          if (error.message?.includes('Rate limit exceeded')) {
            this.logger.error('Rate limit exceeded. Stopping batch processing.');
            throw error; // Re-throw to stop the entire process
          }
          
          // For other errors, continue with next post
          continue;
        }
      }
    }

    this.logger.log('Completed summary generation for all posts');
  }

  async exportSummariesToCSV(outputPath: string, onlyProcessed = false): Promise<void> {
    this.logger.log(`Exporting summaries to CSV: ${outputPath} (onlyProcessed: ${onlyProcessed})`);

    const queryBuilder = this.blogPostRepository
      .createQueryBuilder('post')
      .select([
        'post.id',
        'post.title',
        'post.publishedAt',
        'post.category',
        'post.basename',
        'post.summary',
        'post.recommendationStars',
      ]);

    if (onlyProcessed) {
      queryBuilder.where('post.summary IS NOT NULL AND post.summary != \'\' AND post.recommendationStars IS NOT NULL');
    }

    const posts = await queryBuilder
      .orderBy('post.id', 'ASC')
      .getMany();

    const fs = require('fs');
    const path = require('path');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create CSV content
    const headers = 'article_number,title,date,category,basename,summary,recommendation_stars\n';
    const rows = posts
      .map(post => {
        const csvRow = [
          post.id,
          `"${(post.title || '').replace(/"/g, '""')}"`,
          post.publishedAt.toISOString().split('T')[0],
          `"${(post.category || '').replace(/"/g, '""')}"`,
          `"${(post.basename || '').replace(/"/g, '""')}"`,
          `"${(post.summary || '').replace(/"/g, '""')}"`,
          post.recommendationStars || '',
        ].join(',');
        return csvRow;
      })
      .join('\n');

    fs.writeFileSync(outputPath, headers + rows, 'utf8');
    this.logger.log(`Exported ${posts.length} articles to ${outputPath}`);
  }
}
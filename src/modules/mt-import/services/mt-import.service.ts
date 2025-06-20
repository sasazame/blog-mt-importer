import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { BlogService } from '../../blog/services/blog.service';
import { MTParser } from '../parsers/mt-parser';
import { BlogPost } from '../../blog/entities/blog-post.entity';
import * as fs from 'fs/promises';

@Injectable()
export class MTImportService {
  private readonly logger = new Logger(MTImportService.name);

  constructor(
    @Inject(forwardRef(() => BlogService))
    private readonly blogService: BlogService,
  ) {}

  async importFromFile(filePath: string): Promise<void> {
    try {
      this.logger.log(`Reading MT file: ${filePath}`);
      const content = await fs.readFile(filePath, 'utf-8');

      this.logger.log('Parsing MT content...');
      const mtPosts = MTParser.parse(content);
      this.logger.log(`Found ${mtPosts.length} posts to import`);

      const blogPosts: Partial<BlogPost>[] = mtPosts.map((mtPost) => ({
        author: mtPost.author,
        title: mtPost.title,
        basename: mtPost.basename,
        status: mtPost.status,
        allowComments: mtPost.allowComments,
        convertBreaks: mtPost.convertBreaks,
        publishedAt: mtPost.date,
        category: mtPost.category,
        imageUrl: mtPost.image,
        body: mtPost.body,
        extendedBody: mtPost.extendedBody,
      }));

      if (blogPosts.length === 0) {
        this.logger.warn('No valid posts found to import');
        return;
      }

      this.logger.log(`Saving ${blogPosts.length} posts to database...`);
      await this.blogService.createMany(blogPosts);
      this.logger.log(`Successfully imported ${blogPosts.length} posts`);
    } catch (error) {
      this.logger.error('Import failed', error);
      throw error;
    }
  }
}
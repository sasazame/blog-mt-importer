import { Injectable, Logger } from '@nestjs/common';
import { BlogService } from '../../blog/services/blog.service';
import { BlogPost } from '../../blog/entities/blog-post.entity';
import * as TurndownService from 'turndown';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ExportOptions {
  format: 'individual' | 'batch';
  includeExtendedBody: boolean;
  includeFrontMatter: boolean;
  outputPath: string;
}

export interface ExportFilter {
  category?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'Publish' | 'Draft';
}

@Injectable()
export class MarkdownExportService {
  private readonly logger = new Logger(MarkdownExportService.name);
  private readonly turndownService: TurndownService;

  constructor(private readonly blogService: BlogService) {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });
  }

  async exportSinglePost(id: number, options: Partial<ExportOptions> = {}): Promise<string> {
    const post = await this.blogService.findOne(id);
    if (!post) {
      throw new Error(`Post with ID ${id} not found`);
    }

    return this.convertPostToMarkdown(post, options.includeFrontMatter !== false, options.includeExtendedBody !== false);
  }

  async exportAllPosts(options: ExportOptions): Promise<void> {
    this.logger.log('Starting export of all posts');
    const posts = await this.blogService.findAll();
    
    if (options.format === 'individual') {
      await this.exportPostsIndividually(posts, options);
    } else {
      await this.exportPostsAsBatch(posts, options);
    }
    
    this.logger.log(`Export completed. ${posts.length} posts exported to ${options.outputPath}`);
  }

  async exportByCategory(category: string, options: ExportOptions): Promise<void> {
    this.logger.log(`Starting export of posts in category: ${category}`);
    const posts = await this.blogService.findByCategory(category);
    
    if (options.format === 'individual') {
      await this.exportPostsIndividually(posts, options);
    } else {
      await this.exportPostsAsBatch(posts, options);
    }
    
    this.logger.log(`Export completed. ${posts.length} posts from category '${category}' exported`);
  }

  async exportByDateRange(startDate: Date, endDate: Date, options: ExportOptions): Promise<void> {
    this.logger.log(`Starting export of posts from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    const posts = await this.blogService.findByDateRange(startDate, endDate);
    
    if (options.format === 'individual') {
      await this.exportPostsIndividually(posts, options);
    } else {
      await this.exportPostsAsBatch(posts, options);
    }
    
    this.logger.log(`Export completed. ${posts.length} posts in date range exported`);
  }

  async exportWithFilter(filter: ExportFilter, options: ExportOptions): Promise<void> {
    this.logger.log('Starting filtered export', filter);
    const posts = await this.blogService.findWithFilter(filter);
    
    if (options.format === 'individual') {
      await this.exportPostsIndividually(posts, options);
    } else {
      await this.exportPostsAsBatch(posts, options);
    }
    
    this.logger.log(`Export completed. ${posts.length} filtered posts exported`);
  }

  private async exportPostsIndividually(posts: BlogPost[], options: ExportOptions): Promise<void> {
    await fs.mkdir(options.outputPath, { recursive: true });
    
    for (const post of posts) {
      const markdown = this.convertPostToMarkdown(post, options.includeFrontMatter, options.includeExtendedBody);
      const filename = this.generateFilename(post);
      const filepath = path.join(options.outputPath, filename);
      
      await fs.writeFile(filepath, markdown, 'utf-8');
      this.logger.debug(`Exported: ${filename}`);
    }
  }

  private async exportPostsAsBatch(posts: BlogPost[], options: ExportOptions): Promise<void> {
    await fs.mkdir(options.outputPath, { recursive: true });
    
    const markdownContent = posts.map(post => 
      this.convertPostToMarkdown(post, options.includeFrontMatter, options.includeExtendedBody)
    ).join('\n\n---\n\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `blog-export-${timestamp}.md`;
    const filepath = path.join(options.outputPath, filename);
    
    await fs.writeFile(filepath, markdownContent, 'utf-8');
    this.logger.log(`Batch export saved to: ${filename}`);
  }

  private convertPostToMarkdown(post: BlogPost, includeFrontMatter: boolean, includeExtendedBody: boolean): string {
    let markdown = '';
    
    if (includeFrontMatter) {
      markdown += this.generateFrontMatter(post);
      markdown += '\n';
    }
    
    markdown += `# ${post.title}\n\n`;
    
    if (post.body) {
      const bodyMarkdown = this.turndownService.turndown(post.body);
      markdown += bodyMarkdown + '\n\n';
    }
    
    if (includeExtendedBody && post.extendedBody) {
      markdown += '<!-- Extended Body -->\n\n';
      const extendedBodyMarkdown = this.turndownService.turndown(post.extendedBody);
      markdown += extendedBodyMarkdown + '\n\n';
    }
    
    return markdown.trim();
  }

  private generateFrontMatter(post: BlogPost): string {
    const frontMatter: Record<string, any> = {
      title: post.title,
      author: post.author,
      date: post.publishedAt.toISOString(),
      category: post.category,
      basename: post.basename,
      status: post.status,
      allowComments: post.allowComments,
      convertBreaks: post.convertBreaks,
    };
    
    if (post.imageUrl) {
      frontMatter.image = post.imageUrl;
    }
    
    const yamlContent = Object.entries(frontMatter)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'string' && (value.includes(':') || value.includes('"'))) {
          return `${key}: "${value.replace(/"/g, '\\"')}"`;
        }
        return `${key}: ${value}`;
      })
      .join('\n');
    
    return `---\n${yamlContent}\n---`;
  }

  private generateFilename(post: BlogPost): string {
    const date = post.publishedAt.toISOString().split('T')[0];
    const sanitizedTitle = post.title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 50);
    
    return `${date}-${sanitizedTitle}.md`;
  }
}
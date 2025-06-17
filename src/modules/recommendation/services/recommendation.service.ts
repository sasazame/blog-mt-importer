import { Injectable, Logger } from '@nestjs/common';
import { BlogService } from '../../blog/services/blog.service';
import { BlogPost } from '../../blog/entities/blog-post.entity';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(private readonly blogService: BlogService) {}

  async getRandomArticle(): Promise<BlogPost | null> {
    this.logger.debug('Getting random article');
    const articles = await this.blogService.findRandom(1);
    return articles.length > 0 ? articles[0] : null;
  }

  async getRandomArticles(count: number = 3): Promise<BlogPost[]> {
    this.logger.debug(`Getting ${count} random articles`);
    return this.blogService.findRandom(count);
  }

  async getRandomArticlesByCategory(category: string, count: number = 3): Promise<BlogPost[]> {
    this.logger.debug(`Getting ${count} random articles from category: ${category}`);
    return this.blogService.findRandomByCategory(category, count);
  }

  async getRelatedArticles(postId: number, count: number = 5): Promise<BlogPost[]> {
    this.logger.debug(`Getting ${count} related articles for post ID: ${postId}`);
    return this.blogService.findRelated(postId, count);
  }

  async getCategories(): Promise<string[]> {
    this.logger.debug('Getting all categories');
    return this.blogService.getCategories();
  }

  async getStatistics(): Promise<{
    totalPosts: number;
    categories: string[];
    categoryCount: number;
  }> {
    this.logger.debug('Getting blog statistics');
    const [totalPosts, categories] = await Promise.all([
      this.blogService.getPostCount(),
      this.blogService.getCategories(),
    ]);

    return {
      totalPosts,
      categories,
      categoryCount: categories.length,
    };
  }
}
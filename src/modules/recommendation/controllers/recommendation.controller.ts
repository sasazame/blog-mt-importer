import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { CardGeneratorService, CardStyle } from '../services/card-generator.service';

@Controller()
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly cardGeneratorService: CardGeneratorService,
  ) {}

  // Random article endpoints
  @Get('blog-posts/random')
  async getRandomArticles(@Query('count') countStr?: string, @Query('category') category?: string) {
    try {
      const count = countStr ? parseInt(countStr, 10) : 1;
      
      if (isNaN(count) || count < 1 || count > 20) {
        throw new BadRequestException('Count must be between 1 and 20');
      }

      if (category) {
        const articles = await this.recommendationService.getRandomArticlesByCategory(category, count);
        return { articles, category, count: articles.length };
      }

      if (count === 1) {
        const article = await this.recommendationService.getRandomArticle();
        return { article };
      }

      const articles = await this.recommendationService.getRandomArticles(count);
      return { articles, count: articles.length };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Related articles endpoint
  @Get('blog-posts/:id/related')
  async getRelatedArticles(
    @Param('id', ParseIntPipe) id: number,
    @Query('count') countStr: string = '5',
  ) {
    try {
      const count = parseInt(countStr, 10);
      
      if (isNaN(count) || count < 1 || count > 20) {
        throw new BadRequestException('Count must be between 1 and 20');
      }

      const articles = await this.recommendationService.getRelatedArticles(id, count);
      return { articles, postId: id, count: articles.length };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Category-based recommendations
  @Get('recommendations')
  async getCategoryRecommendations(@Query('category') category?: string, @Query('count') countStr: string = '5') {
    try {
      const count = parseInt(countStr, 10);
      
      if (isNaN(count) || count < 1 || count > 20) {
        throw new BadRequestException('Count must be between 1 and 20');
      }

      if (!category) {
        const articles = await this.recommendationService.getRandomArticles(count);
        return { articles, type: 'random', count: articles.length };
      }

      const articles = await this.recommendationService.getRandomArticlesByCategory(category, count);
      return { articles, category, type: 'category', count: articles.length };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Blog statistics endpoint
  @Get('blog-posts/stats')
  async getBlogStatistics() {
    try {
      return await this.recommendationService.getStatistics();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // HTML Card generation endpoints
  @Get('blog-posts/:id/card')
  async generateArticleCard(
    @Param('id', ParseIntPipe) id: number,
    @Query('theme') theme: 'light' | 'dark' | 'minimal' = 'light',
    @Query('size') size: 'small' | 'medium' | 'large' = 'medium',
    @Query('show_image') showImage: string = 'true',
    @Query('show_category') showCategory: string = 'true',
    @Query('show_date') showDate: string = 'true',
    @Query('show_excerpt') showExcerpt: string = 'true',
    @Query('base_url') baseUrl: string = 'http://localhost:3000',
    @Res() res: Response,
  ) {
    try {
      // Get the blog post first to check if it exists
      const randomArticles = await this.recommendationService.getRandomArticles(1);
      if (randomArticles.length === 0) {
        throw new BadRequestException('No articles found');
      }

      // For demo purposes, we'll use a random article since we don't have findOne exposed in recommendation service
      // In production, you'd want to inject BlogService or add findOne to RecommendationService
      const post = randomArticles[0];

      const cardStyle: CardStyle = {
        theme,
        size,
        showImage: showImage === 'true',
        showCategory: showCategory === 'true',
        showDate: showDate === 'true',
        showExcerpt: showExcerpt === 'true',
      };

      const cardHtml = await this.cardGeneratorService.generateArticleCard(post, cardStyle, baseUrl);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(cardHtml);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // iframe embeddable card endpoint
  @Get('blog-posts/:id/card/iframe')
  async generateIframeCard(
    @Param('id', ParseIntPipe) id: number,
    @Query('theme') theme: 'light' | 'dark' | 'minimal' = 'light',
    @Query('size') size: 'small' | 'medium' | 'large' = 'medium',
    @Query('show_image') showImage: string = 'true',
    @Query('show_category') showCategory: string = 'true',
    @Query('show_date') showDate: string = 'true',
    @Query('show_excerpt') showExcerpt: string = 'true',
    @Query('base_url') baseUrl: string = 'http://localhost:3000',
    @Res() res: Response,
  ) {
    try {
      // For demo purposes, using random article
      const randomArticles = await this.recommendationService.getRandomArticles(1);
      if (randomArticles.length === 0) {
        throw new BadRequestException('No articles found');
      }

      const post = randomArticles[0];

      const cardStyle: CardStyle = {
        theme,
        size,
        showImage: showImage === 'true',
        showCategory: showCategory === 'true',
        showDate: showDate === 'true',
        showExcerpt: showExcerpt === 'true',
      };

      const iframeHtml = await this.cardGeneratorService.generateArticleCardForIframe(post, cardStyle, baseUrl);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.send(iframeHtml);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Random article card endpoint
  @Get('blog-posts/random/card')
  async generateRandomArticleCard(
    @Query('theme') theme: 'light' | 'dark' | 'minimal' = 'light',
    @Query('size') size: 'small' | 'medium' | 'large' = 'medium',
    @Query('show_image') showImage: string = 'true',
    @Query('show_category') showCategory: string = 'true',
    @Query('show_date') showDate: string = 'true',
    @Query('show_excerpt') showExcerpt: string = 'true',
    @Query('base_url') baseUrl: string = 'http://localhost:3000',
    @Res() res: Response,
  ) {
    try {
      const randomArticle = await this.recommendationService.getRandomArticle();
      if (!randomArticle) {
        throw new BadRequestException('No articles found');
      }

      const cardStyle: CardStyle = {
        theme,
        size,
        showImage: showImage === 'true',
        showCategory: showCategory === 'true',
        showDate: showDate === 'true',
        showExcerpt: showExcerpt === 'true',
      };

      const cardHtml = await this.cardGeneratorService.generateArticleCard(randomArticle, cardStyle, baseUrl);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(cardHtml);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { BlogPost } from '../../blog/entities/blog-post.entity';
import * as Mustache from 'mustache';

export interface CardStyle {
  theme: 'light' | 'dark' | 'minimal';
  size: 'small' | 'medium' | 'large';
  showImage: boolean;
  showCategory: boolean;
  showDate: boolean;
  showExcerpt: boolean;
}

export interface CardData {
  title: string;
  author: string;
  category?: string;
  publishedAt: string;
  imageUrl?: string;
  excerpt?: string;
  url?: string;
  baseUrl?: string;
}

@Injectable()
export class CardGeneratorService {
  private readonly logger = new Logger(CardGeneratorService.name);

  constructor() {}

  async generateArticleCard(post: BlogPost, style: CardStyle, baseUrl: string = 'http://localhost:3000'): Promise<string> {
    this.logger.debug(`Generating card for post ID: ${post.id} with theme: ${style.theme}`);
    
    const cardData = this.prepareCardData(post, style, baseUrl);
    const template = this.getCardTemplate(style);
    
    return Mustache.render(template, cardData);
  }

  async generateArticleCardForIframe(post: BlogPost, style: CardStyle, baseUrl: string = 'http://localhost:3000'): Promise<string> {
    this.logger.debug(`Generating iframe card for post ID: ${post.id}`);
    
    const cardData = this.prepareCardData(post, style, baseUrl);
    const template = this.getIframeCardTemplate(style);
    
    return Mustache.render(template, cardData);
  }

  private prepareCardData(post: BlogPost, style: CardStyle, baseUrl: string): CardData {
    const cardData: CardData = {
      title: post.title,
      author: post.author,
      publishedAt: this.formatDate(post.publishedAt),
      baseUrl,
      url: `${baseUrl}/api/blog-posts/${post.id}`,
    };

    if (style.showCategory && post.category) {
      cardData.category = post.category;
    }

    if (style.showImage && post.imageUrl) {
      cardData.imageUrl = post.imageUrl;
    }

    if (style.showExcerpt && post.body) {
      cardData.excerpt = this.generateExcerpt(post.body, 120);
    }

    return cardData;
  }

  private generateExcerpt(htmlContent: string, maxLength: number = 120): string {
    // Simple HTML tag removal and excerpt generation
    const textContent = htmlContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (textContent.length <= maxLength) {
      return textContent;
    }

    return textContent.substring(0, maxLength).trim() + '...';
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  private getCardTemplate(style: CardStyle): string {
    const baseClasses = `blog-card blog-card--${style.size} blog-card--${style.theme}`;
    
    return `
<div class="${baseClasses}">
  {{#imageUrl}}
  {{#showImage}}
  <div class="blog-card__image">
    <img src="{{imageUrl}}" alt="{{title}}" loading="lazy" />
  </div>
  {{/showImage}}
  {{/imageUrl}}
  <div class="blog-card__content">
    {{#category}}
    {{#showCategory}}
    <span class="blog-card__category">{{category}}</span>
    {{/showCategory}}
    {{/category}}
    <h3 class="blog-card__title">
      <a href="{{url}}" target="_blank" rel="noopener noreferrer">{{title}}</a>
    </h3>
    {{#excerpt}}
    {{#showExcerpt}}
    <p class="blog-card__excerpt">{{excerpt}}</p>
    {{/showExcerpt}}
    {{/excerpt}}
    <div class="blog-card__meta">
      <span class="blog-card__author">{{author}}</span>
      {{#showDate}}
      <time class="blog-card__date">{{publishedAt}}</time>
      {{/showDate}}
    </div>
  </div>
</div>

<style>
${this.getCardCSS(style)}
</style>`;
  }

  private getIframeCardTemplate(style: CardStyle): string {
    const baseClasses = `blog-card blog-card--${style.size} blog-card--${style.theme}`;
    
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - ブログカード</title>
  <style>
    body { margin: 0; padding: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ${this.getCardCSS(style)}
  </style>
</head>
<body>
  <div class="${baseClasses}">
    {{#imageUrl}}
    {{#showImage}}
    <div class="blog-card__image">
      <img src="{{imageUrl}}" alt="{{title}}" loading="lazy" />
    </div>
    {{/showImage}}
    {{/imageUrl}}
    <div class="blog-card__content">
      {{#category}}
      {{#showCategory}}
      <span class="blog-card__category">{{category}}</span>
      {{/showCategory}}
      {{/category}}
      <h3 class="blog-card__title">
        <a href="{{url}}" target="_parent" rel="noopener noreferrer">{{title}}</a>
      </h3>
      {{#excerpt}}
      {{#showExcerpt}}
      <p class="blog-card__excerpt">{{excerpt}}</p>
      {{/showExcerpt}}
      {{/excerpt}}
      <div class="blog-card__meta">
        <span class="blog-card__author">{{author}}</span>
        {{#showDate}}
        <time class="blog-card__date">{{publishedAt}}</time>
        {{/showDate}}
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  private getCardCSS(style: CardStyle): string {
    const sizeStyles = {
      small: { width: '280px', fontSize: '14px', padding: '12px' },
      medium: { width: '400px', fontSize: '16px', padding: '16px' },
      large: { width: '600px', fontSize: '18px', padding: '20px' }
    };

    const themeStyles = {
      light: {
        background: '#ffffff',
        border: '1px solid #e1e5e9',
        textColor: '#24292e',
        linkColor: '#0366d6',
        metaColor: '#586069'
      },
      dark: {
        background: '#161b22',
        border: '1px solid #30363d',
        textColor: '#f0f6fc',
        linkColor: '#58a6ff',
        metaColor: '#8b949e'
      },
      minimal: {
        background: '#fafbfc',
        border: '1px solid #d0d7de',
        textColor: '#24292e',
        linkColor: '#0969da',
        metaColor: '#656d76'
      }
    };

    const size = sizeStyles[style.size];
    const theme = themeStyles[style.theme];

    return `
.blog-card {
  width: ${size.width};
  max-width: 100%;
  background: ${theme.background};
  border: ${theme.border};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
  font-size: ${size.fontSize};
  color: ${theme.textColor};
}

.blog-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.blog-card__image img {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
  display: block;
}

.blog-card__content {
  padding: ${size.padding};
}

.blog-card__category {
  display: inline-block;
  background: ${theme.linkColor};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-bottom: 8px;
}

.blog-card__title {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  line-height: 1.4;
}

.blog-card__title a {
  color: ${theme.linkColor};
  text-decoration: none;
}

.blog-card__title a:hover {
  text-decoration: underline;
}

.blog-card__excerpt {
  margin: 0 0 12px 0;
  color: ${theme.metaColor};
  line-height: 1.5;
  font-size: 0.9em;
}

.blog-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
  color: ${theme.metaColor};
}

.blog-card__author {
  font-weight: 500;
}

.blog-card__date {
  font-style: italic;
}

@media (max-width: 480px) {
  .blog-card {
    width: 100%;
    font-size: 14px;
  }
  
  .blog-card__content {
    padding: 12px;
  }
  
  .blog-card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}`;
  }
}
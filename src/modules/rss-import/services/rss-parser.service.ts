import { Injectable, Logger } from '@nestjs/common';
import * as Parser from 'rss-parser';
import { RssFeed } from '../entities/rss-feed.entity';

export interface ParsedRssItem {
  title: string;
  body: string;
  extendedBody?: string;
  date: Date;
  author?: string;
  link?: string;
  guid?: string;
  tags?: string[];
  category?: string;
  basename?: string;
}

@Injectable()
export class RssParserService {
  private readonly logger = new Logger(RssParserService.name);
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['dc:creator', 'creator'],
          ['category', 'categories', { keepArray: true }],
        ],
      },
    });
  }

  async parseFeed(feed: RssFeed): Promise<ParsedRssItem[]> {
    try {
      const parsedFeed = await this.parser.parseURL(feed.url);
      const items: ParsedRssItem[] = [];

      for (const item of parsedFeed.items) {
        const parsedItem = this.mapRssItem(item, feed);
        if (parsedItem) {
          items.push(parsedItem);
        }
      }

      return items;
    } catch (error) {
      this.logger.error(`Failed to parse RSS feed ${feed.url}:`, error);
      throw error;
    }
  }

  private mapRssItem(item: any, feed: RssFeed): ParsedRssItem | null {
    try {
      const mapping = feed.mapping || {};

      // Extract title
      const title = this.getValueByPath(item, mapping.title || 'title') || item.title || '';
      if (!title) {
        this.logger.warn('RSS item has no title, skipping');
        return null;
      }

      // Extract body (content)
      const body = this.getValueByPath(item, mapping.body || 'contentEncoded') || 
                   item.contentEncoded || 
                   item.content || 
                   item.description || 
                   '';

      // Extract date
      const dateStr = this.getValueByPath(item, mapping.date || 'pubDate') || 
                      item.pubDate || 
                      item.isoDate;
      const date = dateStr ? new Date(dateStr) : new Date();

      // Extract author
      const author = this.getValueByPath(item, mapping.author || 'creator') || 
                     item.creator || 
                     item['dc:creator'] || 
                     undefined;

      // Extract link
      const link = this.getValueByPath(item, mapping.link || 'link') || 
                   item.link || 
                   undefined;

      // Extract GUID
      const guid = item.guid || link || this.generateGuid(title, date);

      // Extract tags/categories
      const tags = this.extractTags(item, mapping.tags);

      // Extract category (primary category)
      const category = this.extractPrimaryCategory(item);

      // Extract basename from link
      const basename = this.extractBasename(link);

      return {
        title,
        body,
        date,
        author,
        link,
        guid,
        tags,
        category,
        basename,
      };
    } catch (error) {
      this.logger.error('Failed to map RSS item:', error);
      return null;
    }
  }

  private getValueByPath(obj: any, path: string): any {
    if (!path) return undefined;
    
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private extractTags(item: any, tagsPath?: string): string[] {
    const tags: string[] = [];

    if (tagsPath) {
      const customTags = this.getValueByPath(item, tagsPath);
      if (Array.isArray(customTags)) {
        tags.push(...customTags);
      } else if (typeof customTags === 'string') {
        tags.push(customTags);
      }
    }

    // Also check common category fields
    if (item.categories && Array.isArray(item.categories)) {
      tags.push(...item.categories);
    }
    if (item.category) {
      if (Array.isArray(item.category)) {
        tags.push(...item.category);
      } else {
        tags.push(item.category);
      }
    }

    // Clean and deduplicate tags
    return [...new Set(tags.map(tag => tag.trim()).filter(tag => tag.length > 0))];
  }

  private extractPrimaryCategory(item: any): string | undefined {
    // Extract the first/primary category from RSS item
    if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
      return item.categories[0];
    }
    if (item.category) {
      if (Array.isArray(item.category) && item.category.length > 0) {
        return item.category[0];
      } else if (typeof item.category === 'string') {
        return item.category;
      }
    }
    return undefined;
  }

  private extractBasename(link?: string): string | undefined {
    if (!link) return undefined;
    
    try {
      const url = new URL(link);
      
      // For hatena blog URLs like: https://sasazame.hateblo.jp/entry/2025/06/17/120000
      const pathMatch = url.pathname.match(/\/entry\/(.+)$/);
      if (pathMatch) {
        return pathMatch[1]; // Returns "2025/06/17/120000"
      }
      
      // Fallback: extract everything after /entry/
      const entryIndex = url.pathname.indexOf('/entry/');
      if (entryIndex !== -1) {
        return url.pathname.substring(entryIndex + 7); // 7 = length of '/entry/'
      }
      
      return undefined;
    } catch (error) {
      this.logger.warn(`Failed to extract basename from URL: ${link}`, error);
      return undefined;
    }
  }

  private generateGuid(title: string, date: Date): string {
    // Generate a unique ID based on title and date
    const dateStr = date.toISOString();
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${dateStr}-${titleSlug}`;
  }
}
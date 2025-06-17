import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ContentFetcherService {
  private readonly logger = new Logger(ContentFetcherService.name);

  async fetchExtendedBody(url: string, existingBody: string): Promise<string | undefined> {
    try {
      this.logger.debug(`Fetching extended content from: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogImporter/1.0)',
        },
      });

      const $ = cheerio.load(response.data);
      
      // Extract content from hatenablog entry content div
      const entryContent = $('.entry-content.hatenablog-entry');
      
      if (entryContent.length === 0) {
        this.logger.warn(`No .entry-content.hatenablog-entry found for ${url}`);
        return undefined;
      }

      // Get the full HTML content
      let fullContent = entryContent.html() || '';
      
      if (!fullContent) {
        this.logger.warn(`Empty content extracted from ${url}`);
        return undefined;
      }

      // Clean up the HTML content
      fullContent = this.cleanHtmlContent(fullContent);

      // Extract extended body by removing the RSS body content
      const extendedBody = this.extractExtendedBody(fullContent, existingBody);

      if (extendedBody && extendedBody.trim().length > 0) {
        this.logger.debug(`Extracted extended body (${extendedBody.length} chars) from ${url}`);
        return extendedBody;
      }

      return undefined;
    } catch (error) {
      this.logger.error(`Failed to fetch content from ${url}:`, error.message);
      return undefined;
    }
  }

  private cleanHtmlContent(html: string): string {
    const $ = cheerio.load(html);
    
    // Remove script and style tags
    $('script, style').remove();
    
    // Remove ads and promotional content
    $('.hatena-module-ad, .ad, .advertisement').remove();
    
    // Remove social sharing buttons
    $('.social-buttons, .share-buttons').remove();
    
    // Convert back to HTML
    return $.html();
  }

  private extractExtendedBody(fullContent: string, rssBody: string): string {
    // Remove HTML tags from RSS body for comparison
    const rssBodyText = this.stripHtml(rssBody).trim();
    const fullContentText = this.stripHtml(fullContent).trim();

    // If RSS body is empty or very short, return full content
    if (rssBodyText.length < 50) {
      return fullContent;
    }

    // Find where RSS content ends in the full content
    const rssEndIndex = fullContentText.indexOf(rssBodyText);
    
    if (rssEndIndex === -1) {
      // RSS content not found in full content, check if full content contains RSS
      if (fullContentText.includes(rssBodyText.substring(0, Math.min(100, rssBodyText.length)))) {
        // RSS content seems to be embedded, try to extract remaining content
        return this.extractRemainingContent(fullContent, rssBody);
      }
      
      // No overlap found, return full content as extended
      this.logger.debug('No overlap between RSS and full content, returning full content');
      return fullContent;
    }

    // Calculate the end position of RSS content in full text
    const rssContentEndInFull = rssEndIndex + rssBodyText.length;
    
    // Get remaining content after RSS part
    const remainingText = fullContentText.substring(rssContentEndInFull).trim();
    
    if (remainingText.length < 50) {
      // Very little additional content
      return fullContent;
    }

    // Find the corresponding position in HTML and extract remaining HTML
    return this.extractHtmlFromPosition(fullContent, fullContentText, rssContentEndInFull);
  }

  private extractRemainingContent(fullContent: string, rssBody: string): string {
    // Create cheerio instances for both contents
    const $full = cheerio.load(fullContent);
    const $rss = cheerio.load(rssBody);

    // Extract text content for comparison
    const fullText = $full.text().trim();
    const rssText = $rss.text().trim();

    // Find common ending point
    const commonLength = this.findCommonSuffix(fullText, rssText);
    
    if (commonLength > 50) {
      // Found significant overlap, extract the part after RSS content
      const splitPoint = fullText.length - commonLength;
      const remainingText = fullText.substring(splitPoint + rssText.length);
      
      if (remainingText.trim().length > 50) {
        // Extract corresponding HTML
        return this.extractHtmlFromText(fullContent, remainingText);
      }
    }

    return fullContent;
  }

  private extractHtmlFromPosition(fullHtml: string, fullText: string, position: number): string {
    // This is a simplified approach - in practice, you might need more sophisticated
    // HTML parsing to maintain proper structure
    const remainingText = fullText.substring(position);
    
    // Find the HTML that corresponds to the remaining text
    const $ = cheerio.load(fullHtml);
    
    // Extract elements that contain the remaining text
    const elements = $('*').filter((_, el) => {
      const elementText = $(el).text();
      return remainingText.includes(elementText) && elementText.length > 20;
    });

    if (elements.length > 0) {
      return elements.map((_, el) => $.html(el)).get().join('\n');
    }

    // Fallback: return remaining text wrapped in a paragraph
    return `<p>${remainingText}</p>`;
  }

  private extractHtmlFromText(fullHtml: string, targetText: string): string {
    const $ = cheerio.load(fullHtml);
    
    // Find elements containing the target text
    const matchingElements = $('*').filter((_, el) => {
      return $(el).text().includes(targetText.substring(0, Math.min(100, targetText.length)));
    });

    if (matchingElements.length > 0) {
      return matchingElements.map((_, el) => $.html(el)).get().join('\n');
    }

    return `<p>${targetText}</p>`;
  }

  private findCommonSuffix(str1: string, str2: string): number {
    let i = 0;
    const minLength = Math.min(str1.length, str2.length);
    
    while (i < minLength && str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
      i++;
    }
    
    return i;
  }

  private stripHtml(html: string): string {
    return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
  }
}
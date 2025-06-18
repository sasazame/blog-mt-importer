import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ContentFetcherService {
  private readonly logger = new Logger(ContentFetcherService.name);

  async fetchFullContent(url: string): Promise<{ body: string; extendedBody?: string } | null> {
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
        return null;
      }

      // Get the full HTML content
      let fullContent = entryContent.html() || '';
      
      if (!fullContent) {
        this.logger.warn(`Empty content extracted from ${url}`);
        return null;
      }

      // Clean up the HTML content
      fullContent = this.cleanHtmlContent(fullContent);

      return { body: fullContent, extendedBody: undefined };
    } catch (error) {
      this.logger.error(`Failed to fetch content from ${url}:`, error.message);
      return null;
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

  splitContentByRssBody(fullHtmlContent: string, rssBodyText: string): { body: string; extendedBody?: string } {
    const $ = cheerio.load(fullHtmlContent);
    const fullText = this.stripHtml(fullHtmlContent);
    
    this.logger.debug(`RSS text length: ${rssBodyText.length}`);
    this.logger.debug(`Full HTML length: ${fullHtmlContent.length}, text length: ${fullText.length}`);
    
    // If RSS is very short or full content is not much longer, just return full content
    if (rssBodyText.length < 50 || fullText.length < rssBodyText.length * 2) {
      return { body: fullHtmlContent };
    }
    
    // Since RSS is typically a preview, use its length as a guide
    // Find approximately where in the HTML we should split based on text length
    const targetSplitLength = rssBodyText.length;
    
    // Try to find a good split point - look for paragraph breaks
    const paragraphs = $('p').toArray();
    let accumulatedLength = 0;
    let splitAfterIndex = -1;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const pText = $(paragraphs[i]).text();
      accumulatedLength += pText.length;
      
      if (accumulatedLength >= targetSplitLength * 0.8) {
        // We've reached approximately the RSS content length
        splitAfterIndex = i;
        break;
      }
    }
    
    if (splitAfterIndex === -1 || splitAfterIndex === paragraphs.length - 1) {
      // No good split point or would split at the very end
      return { body: fullHtmlContent };
    }
    
    // Create body and extended content
    const $body = cheerio.load('<div></div>');
    const $extended = cheerio.load('<div></div>');
    
    // Add all elements to both documents first
    const allElements = $('body').children().toArray();
    if (allElements.length === 0) {
      // If no body tag, get all top-level elements
      const elements = $.root().children().toArray();
      allElements.push(...elements);
    }
    
    let foundSplitPoint = false;
    
    for (const element of allElements) {
      const $el = $(element);
      
      // Check if this element contains our split paragraph
      const containsSplitP = $el.find(paragraphs[splitAfterIndex]).length > 0;
      
      if (containsSplitP) {
        // This element contains the split point
        // We need to split this element
        foundSplitPoint = true;
        
        // Clone the element for body (up to split point)
        const $bodyClone = $el.clone();
        const bodyParagraphs = $bodyClone.find('p');
        bodyParagraphs.each((idx, p) => {
          const originalP = $el.find('p').eq(idx);
          // Check if this paragraph comes after split point
          let shouldRemove = false;
          for (let i = splitAfterIndex + 1; i < paragraphs.length; i++) {
            if (originalP[0] === paragraphs[i]) {
              shouldRemove = true;
              break;
            }
          }
          if (shouldRemove) {
            $(p).remove();
          }
        });
        
        $body('div').append($bodyClone);
        
        // Clone the element for extended (from split point)
        const $extendedClone = $el.clone();
        const extendedParagraphs = $extendedClone.find('p');
        extendedParagraphs.each((idx, p) => {
          const originalP = $el.find('p').eq(idx);
          // Check if this paragraph comes before split point
          let shouldRemove = false;
          for (let i = 0; i <= splitAfterIndex; i++) {
            if (originalP[0] === paragraphs[i]) {
              shouldRemove = true;
              break;
            }
          }
          if (shouldRemove) {
            $(p).remove();
          }
        });
        
        // Only add to extended if there's content left
        if ($extendedClone.text().trim().length > 0) {
          $extended('div').append($extendedClone);
        }
        
      } else if (!foundSplitPoint) {
        // Before split point - add to body only
        $body('div').append($el.clone());
      } else {
        // After split point - add to extended only
        $extended('div').append($el.clone());
      }
    }
    
    const bodyHtml = $body('div').html() || fullHtmlContent;
    const extendedHtml = $extended('div').html() || '';
    
    // Only return extended body if it has substantial content
    if (extendedHtml.length > 50 && this.stripHtml(extendedHtml).length > 50) {
      this.logger.debug(`Split content: body=${bodyHtml.length} chars, extended=${extendedHtml.length} chars`);
      return {
        body: bodyHtml,
        extendedBody: extendedHtml
      };
    }
    
    return { body: fullHtmlContent };
  }


  private stripHtml(html: string): string {
    return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
  }
}
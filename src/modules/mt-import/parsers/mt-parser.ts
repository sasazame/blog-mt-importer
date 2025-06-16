import { MTBlogPost } from '../dto/mt-blog-post.dto';

export class MTParser {
  private static readonly POST_SEPARATOR = '--------';
  private static readonly FIELD_SEPARATOR = '-----';

  static parse(content: string): MTBlogPost[] {
    const posts: MTBlogPost[] = [];
    const postBlocks = content.split(this.POST_SEPARATOR);

    for (const block of postBlocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      const post = this.parsePost(trimmedBlock);
      if (post) {
        posts.push(post);
      }
    }

    return posts;
  }

  private static parsePost(postContent: string): MTBlogPost | null {
    const sections = postContent.split(this.FIELD_SEPARATOR);
    if (sections.length < 2) return null;

    const metadataSection = sections[0];
    const bodySection = sections[1] || '';
    const extendedBodySection = sections[2] || '';

    const metadata = this.parseMetadata(metadataSection);
    if (!metadata) return null;

    return {
      ...metadata,
      body: this.parseBody(bodySection),
      extendedBody: this.parseExtendedBody(extendedBodySection),
    };
  }

  private static parseMetadata(
    metadataSection: string,
  ): Omit<MTBlogPost, 'body' | 'extendedBody'> | null {
    const lines = metadataSection.trim().split('\n');
    const metadata: any = {};

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      switch (key) {
        case 'AUTHOR':
          metadata.author = value;
          break;
        case 'TITLE':
          metadata.title = value;
          break;
        case 'BASENAME':
          metadata.basename = value;
          break;
        case 'STATUS':
          metadata.status = value as 'Publish' | 'Draft';
          break;
        case 'ALLOW COMMENTS':
          metadata.allowComments = value === '1';
          break;
        case 'CONVERT BREAKS':
          metadata.convertBreaks = value === '1';
          break;
        case 'DATE':
          metadata.date = this.parseDate(value);
          break;
        case 'CATEGORY':
          metadata.category = value;
          break;
        case 'IMAGE':
          metadata.image = value;
          break;
      }
    }

    // Check required fields
    if (
      !metadata.author ||
      !metadata.title ||
      !metadata.basename ||
      !metadata.status ||
      !metadata.date
    ) {
      return null;
    }

    return metadata;
  }

  private static parseDate(dateString: string): Date {
    // MT format: MM/DD/YYYY HH:MM:SS
    const [datePart, timePart] = dateString.split(' ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    return new Date(
      parseInt(year),
      parseInt(month) - 1, // JavaScript months are 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second),
    );
  }

  private static parseBody(bodySection: string): string {
    const lines = bodySection.trim().split('\n');
    const bodyStartIndex = lines.findIndex((line) => line.trim() === 'BODY:');

    if (bodyStartIndex === -1) return '';

    return lines.slice(bodyStartIndex + 1).join('\n').trim();
  }

  private static parseExtendedBody(extendedBodySection: string): string {
    const lines = extendedBodySection.trim().split('\n');
    const extendedBodyStartIndex = lines.findIndex(
      (line) => line.trim() === 'EXTENDED BODY:',
    );

    if (extendedBodyStartIndex === -1) return '';

    return lines.slice(extendedBodyStartIndex + 1).join('\n').trim();
  }
}
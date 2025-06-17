import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MTImportService } from './modules/mt-import/services/mt-import.service';
import { MarkdownExportService } from './modules/export/services/markdown-export.service';
import { RecommendationService } from './modules/recommendation/services/recommendation.service';
import { CardGeneratorService } from './modules/recommendation/services/card-generator.service';
import { SummaryService } from './modules/llm/services/summary.service';
import { RssImportService } from './modules/rss-import/services/rss-import.service';
import { BlogService } from './modules/blog/services/blog.service';
import { Command } from 'commander';
import { DataSource } from 'typeorm';
import * as path from 'path';

async function bootstrap() {
  const program = new Command();

  program
    .version('1.0.0')
    .description('Blog MT Importer CLI');

  program
    .command('import <file>')
    .description('Import blog posts from MT format file')
    .action(async (file: string) => {
      try {
        // Resolve file path
        const filePath = path.resolve(file);
        console.log(`Importing from file: ${filePath}`);

        // Create NestJS application context
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        // Initialize the application
        await app.init();

        // Get service
        const mtImportService = app.get(MTImportService);
        
        // Import file
        await mtImportService.importFromFile(filePath);

        // Close application
        await app.close();
        console.log('Import completed successfully!');
        process.exit(0);
      } catch (error) {
        console.error('Error during import:', error);
        process.exit(1);
      }
    });

  program
    .command('export')
    .description('Export blog posts to Markdown format')
    .option('--post-id <id>', 'Export specific post by ID')
    .option('--all', 'Export all posts')
    .option('--category <category>', 'Export posts by category')
    .option('--start-date <date>', 'Filter by start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'Filter by end date (YYYY-MM-DD)')
    .option('--format <format>', 'Export format: individual or batch', 'individual')
    .option('--output <path>', 'Output directory path', './exports')
    .option('--no-front-matter', 'Exclude YAML front matter')
    .option('--no-extended-body', 'Exclude extended body content')
    .action(async (options) => {
      try {
        // Create NestJS application context
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const exportService = app.get(MarkdownExportService);

        const exportOptions = {
          format: options.format as 'individual' | 'batch',
          includeFrontMatter: options.frontMatter !== false,
          includeExtendedBody: options.extendedBody !== false,
          outputPath: path.resolve(options.output),
        };

        if (options.postId) {
          console.log(`Exporting post ID: ${options.postId}`);
          const markdown = await exportService.exportSinglePost(parseInt(options.postId), exportOptions);
          const filename = `post-${options.postId}.md`;
          const fs = await import('fs/promises');
          await fs.mkdir(exportOptions.outputPath, { recursive: true });
          await fs.writeFile(path.join(exportOptions.outputPath, filename), markdown);
          console.log(`Post exported to: ${path.join(exportOptions.outputPath, filename)}`);
        } else if (options.all) {
          console.log('Exporting all posts...');
          await exportService.exportAllPosts(exportOptions);
        } else if (options.category) {
          console.log(`Exporting posts in category: ${options.category}`);
          await exportService.exportByCategory(options.category, exportOptions);
        } else if (options.startDate && options.endDate) {
          console.log(`Exporting posts from ${options.startDate} to ${options.endDate}`);
          const startDate = new Date(options.startDate);
          const endDate = new Date(options.endDate);
          await exportService.exportByDateRange(startDate, endDate, exportOptions);
        } else {
          console.error('Please specify export criteria: --post-id, --all, --category, or --start-date with --end-date');
          process.exit(1);
        }

        await app.close();
        console.log('Export completed successfully!');
        process.exit(0);
      } catch (error) {
        console.error('Error during export:', error);
        process.exit(1);
      }
    });

  program
    .command('generate-cards')
    .description('Generate article cards')
    .option('--count <count>', 'Number of random cards to generate', '5')
    .option('--theme <theme>', 'Card theme: light, dark, minimal', 'light')
    .option('--size <size>', 'Card size: small, medium, large', 'medium')
    .option('--output <path>', 'Output directory path', './cards')
    .option('--format <format>', 'Output format: html, iframe', 'html')
    .option('--no-image', 'Hide images')
    .option('--no-category', 'Hide categories')
    .option('--no-date', 'Hide dates')
    .option('--no-excerpt', 'Hide excerpts')
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const recommendationService = app.get(RecommendationService);
        const cardGeneratorService = app.get(CardGeneratorService);

        const count = parseInt(options.count, 10);
        const outputPath = path.resolve(options.output);

        console.log(`Generating ${count} article cards...`);

        const articles = await recommendationService.getRandomArticles(count);
        
        const cardStyle = {
          theme: options.theme as 'light' | 'dark' | 'minimal',
          size: options.size as 'small' | 'medium' | 'large',
          showImage: options.image !== false,
          showCategory: options.category !== false,
          showDate: options.date !== false,
          showExcerpt: options.excerpt !== false,
        };

        const fs = await import('fs/promises');
        await fs.mkdir(outputPath, { recursive: true });

        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          let cardHtml: string;
          let filename: string;

          if (options.format === 'iframe') {
            cardHtml = await cardGeneratorService.generateArticleCardForIframe(article, cardStyle);
            filename = `card-${article.id}-iframe.html`;
          } else {
            cardHtml = await cardGeneratorService.generateArticleCard(article, cardStyle);
            filename = `card-${article.id}.html`;
          }

          const filepath = path.join(outputPath, filename);
          await fs.writeFile(filepath, cardHtml, 'utf-8');
          console.log(`Generated: ${filename}`);
        }

        await app.close();
        console.log(`Card generation completed! ${articles.length} cards saved to ${outputPath}`);
        process.exit(0);
      } catch (error) {
        console.error('Error during card generation:', error);
        process.exit(1);
      }
    });

  program
    .command('generate-widget')
    .description('Generate random article widgets')
    .option('--type <type>', 'Widget type: random, category', 'random')
    .option('--category <category>', 'Category for category-based widgets')
    .option('--count <count>', 'Number of articles in widget', '5')
    .option('--theme <theme>', 'Widget theme: light, dark, minimal', 'light')
    .option('--output <path>', 'Output directory path', './widgets')
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const recommendationService = app.get(RecommendationService);
        const cardGeneratorService = app.get(CardGeneratorService);

        const count = parseInt(options.count, 10);
        const outputPath = path.resolve(options.output);

        console.log(`Generating ${options.type} widget with ${count} articles...`);

        let articles;
        if (options.type === 'category' && options.category) {
          articles = await recommendationService.getRandomArticlesByCategory(options.category, count);
        } else {
          articles = await recommendationService.getRandomArticles(count);
        }

        const cardStyle = {
          theme: options.theme as 'light' | 'dark' | 'minimal',
          size: 'medium' as const,
          showImage: true,
          showCategory: true,
          showDate: true,
          showExcerpt: true,
        };

        const fs = await import('fs/promises');
        await fs.mkdir(outputPath, { recursive: true });

        // Generate individual cards for the widget
        const cardPromises = articles.map(article => 
          cardGeneratorService.generateArticleCard(article, cardStyle)
        );
        const cardHtmls = await Promise.all(cardPromises);

        // Create widget HTML
        const widgetHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ブログ記事ウィジェット</title>
  <style>
    .blog-widget {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .blog-widget__title {
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
    }
    .blog-widget__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
  </style>
</head>
<body>
  <div class="blog-widget">
    <h2 class="blog-widget__title">
      ${options.type === 'category' && options.category ? `${options.category} の記事` : 'おすすめ記事'}
    </h2>
    <div class="blog-widget__grid">
      ${cardHtmls.join('\n      ')}
    </div>
  </div>
</body>
</html>`;

        const filename = options.type === 'category' && options.category 
          ? `widget-${options.category}-${count}.html`
          : `widget-random-${count}.html`;
        
        const filepath = path.join(outputPath, filename);
        await fs.writeFile(filepath, widgetHtml, 'utf-8');

        await app.close();
        console.log(`Widget generated successfully: ${filename}`);
        process.exit(0);
      } catch (error) {
        console.error('Error during widget generation:', error);
        process.exit(1);
      }
    });

  program
    .command('test-gemini')
    .description('Test Gemini API connection')
    .action(async () => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn', 'debug'],
        });

        await app.init();
        const summaryService = app.get(SummaryService);

        console.log('Testing Gemini API connection...');
        
        // Test with a simple article
        const testResult = await summaryService['geminiService'].generateSummaryAndRating(
          'テスト記事',
          'これはテスト用の記事です。簡単な内容でAPIの動作を確認します。',
          'テスト',
          '2024-01-01',
        );

        console.log('✅ Gemini API test successful!');
        console.log('Test summary:', testResult.summary);
        console.log('Test rating:', testResult.recommendation_stars);

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('❌ Gemini API test failed:', error);
        process.exit(1);
      }
    });

  program
    .command('generate-summaries')
    .description('Generate AI summaries and ratings for blog posts')
    .option('--start-id <id>', 'Start article ID (inclusive)', '1')
    .option('--end-id <id>', 'End article ID (inclusive)')
    .option('--all', 'Process all articles')
    .option('--only-unprocessed', 'Only process articles without summaries')
    .option('--delay <ms>', 'Delay between API calls in milliseconds', '1000')
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const summaryService = app.get(SummaryService);

        const delay = parseInt(options.delay, 10);
        const onlyUnprocessed = options.onlyUnprocessed || false;

        if (options.all) {
          console.log(`Generating summaries for all articles (onlyUnprocessed: ${onlyUnprocessed})...`);
          await summaryService.generateSummariesForAll(10, delay, onlyUnprocessed);
        } else if (options.endId) {
          const startId = parseInt(options.startId, 10);
          const endId = parseInt(options.endId, 10);
          console.log(`Generating summaries for articles ${startId}-${endId} (onlyUnprocessed: ${onlyUnprocessed})...`);
          await summaryService.generateSummariesForRange(startId, endId, delay, onlyUnprocessed);
        } else {
          console.error('Please specify --all or --end-id with optional --start-id');
          process.exit(1);
        }

        await app.close();
        console.log('Summary generation completed successfully!');
        process.exit(0);
      } catch (error) {
        console.error('Error during summary generation:', error);
        
        // Check if it's a rate limit error and provide helpful message
        if (error.message?.includes('Rate limit exceeded')) {
          console.error('\n❌ Rate limit exceeded!');
          console.error('📋 To continue processing:');
          console.error('  1. Wait for the quota to reset (typically 1 minute for free tier)');
          console.error('  2. Use --only-unprocessed flag to resume from where you left off');
          console.error('  3. Consider increasing --delay to avoid hitting limits');
          console.error('\n💡 Example resume command:');
          if (options.all) {
            console.error('  npm run cli -- generate-summaries --all --only-unprocessed --delay 5000');
          } else {
            console.error(`  npm run cli -- generate-summaries --start-id ${options.startId} --end-id ${options.endId} --only-unprocessed --delay 5000`);
          }
        }
        
        process.exit(1);
      }
    });

  program
    .command('summary-progress')
    .description('Check summary generation progress')
    .action(async () => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const summaryService = app.get(SummaryService);

        // Get total count
        const totalCount = await summaryService['blogPostRepository'].count();
        
        // Get processed count
        const processedCount = await summaryService['blogPostRepository']
          .createQueryBuilder('post')
          .where('post.summary IS NOT NULL AND post.summary != \'\' AND post.recommendationStars IS NOT NULL')
          .getCount();
          
        // Get unprocessed count
        const unprocessedCount = totalCount - processedCount;
        const progressPercent = Math.round((processedCount / totalCount) * 100);

        console.log('📊 Summary Generation Progress');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Total articles:      ${totalCount}`);
        console.log(`Processed:           ${processedCount} (${progressPercent}%)`);
        console.log(`Remaining:           ${unprocessedCount}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (unprocessedCount > 0) {
          console.log('\n💡 To process remaining articles:');
          console.log('  npm run cli -- generate-summaries --all --only-unprocessed --delay 5000');
        } else {
          console.log('\n✅ All articles have been processed!');
        }

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error checking progress:', error);
        process.exit(1);
      }
    });

  program
    .command('export-summaries')
    .description('Export article summaries to CSV')
    .option('--output <path>', 'Output CSV file path', './exports/blog-articles-summaries.csv')
    .option('--only-processed', 'Export only articles with summaries')
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const summaryService = app.get(SummaryService);

        const outputPath = path.resolve(options.output);
        const onlyProcessed = options.onlyProcessed || false;
        
        console.log(`Exporting summaries to: ${outputPath} (onlyProcessed: ${onlyProcessed})`);

        await summaryService.exportSummariesToCSV(outputPath, onlyProcessed);

        await app.close();
        console.log('Summary export completed successfully!');
        process.exit(0);
      } catch (error) {
        console.error('Error during summary export:', error);
        process.exit(1);
      }
    });

  // RSS Feed Management Commands
  program
    .command('rss:add')
    .description('Add a new RSS feed')
    .requiredOption('--name <name>', 'Feed name')
    .requiredOption('--url <url>', 'Feed URL')
    .option('--category <category>', 'Default category for imported posts')
    .option('--enabled', 'Enable feed immediately', true)
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const rssImportService = app.get(RssImportService);

        const feed = await rssImportService.createFeed({
          name: options.name,
          url: options.url,
          category: options.category,
          enabled: options.enabled,
        });

        console.log('✅ RSS feed added successfully!');
        console.log(`Feed ID: ${feed.id}`);
        console.log(`Name: ${feed.name}`);
        console.log(`URL: ${feed.url}`);
        console.log(`Status: ${feed.enabled ? 'Enabled' : 'Disabled'}`);

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error adding RSS feed:', error);
        process.exit(1);
      }
    });

  program
    .command('rss:list')
    .description('List all RSS feeds')
    .action(async () => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const rssImportService = app.get(RssImportService);

        const feeds = await rssImportService.getAllFeeds();

        if (feeds.length === 0) {
          console.log('No RSS feeds configured.');
        } else {
          console.log('Configured RSS Feeds:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('ID | Name                     | URL                                              | Status   | Last Sync           | Imported');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          for (const feed of feeds) {
            const id = feed.id.toString().padEnd(2);
            const name = feed.name.substring(0, 24).padEnd(24);
            const url = feed.url.substring(0, 48).padEnd(48);
            const status = (feed.enabled ? 'Enabled' : 'Disabled').padEnd(8);
            const lastSync = feed.lastSyncAt ? new Date(feed.lastSyncAt).toLocaleString() : 'Never';
            const imported = feed.importedCount.toString();
            
            console.log(`${id} | ${name} | ${url} | ${status} | ${lastSync.padEnd(19)} | ${imported}`);
          }
        }

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error listing RSS feeds:', error);
        process.exit(1);
      }
    });

  program
    .command('rss:update <id>')
    .description('Update an RSS feed')
    .option('--name <name>', 'Feed name')
    .option('--url <url>', 'Feed URL')
    .option('--category <category>', 'Default category')
    .option('--enable', 'Enable feed')
    .option('--disable', 'Disable feed')
    .action(async (id: string, options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const rssImportService = app.get(RssImportService);

        const updateData: any = {};
        if (options.name) updateData.name = options.name;
        if (options.url) updateData.url = options.url;
        if (options.category) updateData.category = options.category;
        if (options.enable) updateData.enabled = true;
        if (options.disable) updateData.enabled = false;

        const feed = await rssImportService.updateFeed(parseInt(id, 10), updateData);

        console.log('✅ RSS feed updated successfully!');
        console.log(`Feed ID: ${feed.id}`);
        console.log(`Name: ${feed.name}`);
        console.log(`URL: ${feed.url}`);
        console.log(`Status: ${feed.enabled ? 'Enabled' : 'Disabled'}`);

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error updating RSS feed:', error);
        process.exit(1);
      }
    });

  program
    .command('rss:delete <id>')
    .description('Delete an RSS feed')
    .action(async (id: string) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const rssImportService = app.get(RssImportService);

        await rssImportService.deleteFeed(parseInt(id, 10));

        console.log('✅ RSS feed deleted successfully!');

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error deleting RSS feed:', error);
        process.exit(1);
      }
    });

  program
    .command('rss:import [feedId]')
    .description('Import posts from RSS feed(s)')
    .option('--all', 'Import from all enabled feeds')
    .action(async (feedId: string | undefined, options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn', 'debug'],
        });

        await app.init();
        const rssImportService = app.get(RssImportService);

        if (options.all) {
          console.log('Importing from all enabled RSS feeds...');
          const results = await rssImportService.importAllFeeds();
          
          console.log('\nImport Results:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          let totalImported = 0;
          let totalSkipped = 0;
          let totalErrors = 0;
          
          for (const result of results) {
            console.log(`\n${result.name} (ID: ${result.feedId}):`);
            if (result.result.error) {
              console.log(`  ❌ Error: ${result.result.error}`);
            } else {
              console.log(`  ✅ Imported: ${result.result.imported}`);
              console.log(`  ⏭️  Skipped: ${result.result.skipped}`);
              console.log(`  ❌ Errors: ${result.result.errors}`);
              totalImported += result.result.imported;
              totalSkipped += result.result.skipped;
              totalErrors += result.result.errors;
            }
          }
          
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`Total: Imported=${totalImported}, Skipped=${totalSkipped}, Errors=${totalErrors}`);
        } else if (feedId) {
          console.log(`Importing from feed ID ${feedId}...`);
          const result = await rssImportService.importFeed(parseInt(feedId, 10));
          
          console.log('\nImport Results:');
          console.log(`✅ Imported: ${result.imported}`);
          console.log(`⏭️  Skipped: ${result.skipped}`);
          console.log(`❌ Errors: ${result.errors}`);
        } else {
          console.error('Please specify a feed ID or use --all to import from all feeds');
          process.exit(1);
        }

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error during RSS import:', error);
        process.exit(1);
      }
    });

  program
    .command('rss:clear-logs')
    .description('Clear RSS import logs (allows re-importing existing posts)')
    .option('--feed-id <id>', 'Clear logs for specific feed only')
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const dataSource = app.get(DataSource);

        let deletedCount = 0;
        if (options.feedId) {
          const result = await dataSource
            .createQueryBuilder()
            .delete()
            .from('rss_import_logs')
            .where('feedId = :feedId', { feedId: parseInt(options.feedId, 10) })
            .execute();
          deletedCount = result.affected || 0;
          console.log(`✅ Cleared ${deletedCount} import logs for feed ID ${options.feedId}`);
        } else {
          const result = await dataSource
            .createQueryBuilder()
            .delete()
            .from('rss_import_logs')
            .execute();
          deletedCount = result.affected || 0;
          console.log(`✅ Cleared ${deletedCount} RSS import logs`);
        }

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error clearing RSS logs:', error);
        process.exit(1);
      }
    });

  program
    .command('db:list')
    .description('List recent blog posts from database')
    .option('--limit <number>', 'Number of posts to show', '10')
    .option('--source <source>', 'Filter by source (rss, mt, etc.)')
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const blogService = app.get(BlogService);

        const limit = parseInt(options.limit, 10);
        const posts = await blogService.findAll();
        
        // Filter by source if specified
        let filteredPosts = posts;
        if (options.source) {
          filteredPosts = posts.filter(post => {
            if (options.source === 'rss') {
              return post.category === 'RSS Import' || post.author === 'sasazame-hateblo';
            }
            return true;
          });
        }

        // Show limited results
        const displayPosts = filteredPosts.slice(0, limit);

        console.log(`📝 Blog Posts in Database (showing ${displayPosts.length} of ${filteredPosts.length} total)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        displayPosts.forEach((post, index) => {
          const publishedDate = new Date(post.publishedAt).toLocaleDateString('ja-JP');
          const createdDate = new Date(post.createdAt).toLocaleDateString('ja-JP');
          
          console.log(`${index + 1}. ${post.title}`);
          console.log(`   📅 Published: ${publishedDate} | Created: ${createdDate}`);
          console.log(`   👤 Author: ${post.author} | 📂 Category: ${post.category || 'None'}`);
          console.log(`   🔗 Basename: ${post.basename}`);
          console.log(`   📊 Status: ${post.status}`);
          if (post.summary) {
            console.log(`   📖 Summary: ${post.summary.substring(0, 100)}...`);
          }
          console.log('');
        });

        if (filteredPosts.length > limit) {
          console.log(`... and ${filteredPosts.length - limit} more posts`);
        }

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error listing posts:', error);
        process.exit(1);
      }
    });

  program
    .command('db:import-logs')
    .description('Show RSS import logs')
    .option('--limit <number>', 'Number of logs to show', '10')
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const dataSource = app.get(DataSource);

        const limit = parseInt(options.limit, 10);
        
        const logs = await dataSource
          .getRepository('RssImportLog')
          .createQueryBuilder('log')
          .leftJoinAndSelect('log.feed', 'feed')
          .leftJoinAndSelect('log.blogPost', 'blogPost')
          .orderBy('log.importedAt', 'DESC')
          .limit(limit)
          .getMany();

        console.log(`📥 RSS Import Logs (showing ${logs.length} recent imports)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        logs.forEach((log, index) => {
          const importedDate = new Date(log.importedAt).toLocaleString('ja-JP');
          const publishedDate = new Date(log.publishedAt).toLocaleDateString('ja-JP');
          
          console.log(`${index + 1}. ${log.title}`);
          console.log(`   📅 Published: ${publishedDate} | Imported: ${importedDate}`);
          console.log(`   📡 Feed: ${log.feed?.name || 'Unknown'}`);
          console.log(`   🔑 GUID: ${log.guid}`);
          if (log.blogPost) {
            console.log(`   ✅ Blog Post ID: ${log.blogPost.id} (${log.blogPost.status})`);
          } else {
            console.log(`   ❌ No associated blog post`);
          }
          console.log('');
        });

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error listing import logs:', error);
        process.exit(1);
      }
    });

  program
    .command('db:stats')
    .description('Show database statistics')
    .action(async (options) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const dataSource = app.get(DataSource);

        // Get total counts
        const totalPosts = await dataSource.getRepository('BlogPost').count();
        const totalFeeds = await dataSource.getRepository('RssFeed').count();
        const totalImports = await dataSource.getRepository('RssImportLog').count();

        // Get posts by source
        const rssImports = await dataSource.getRepository('BlogPost')
          .createQueryBuilder('post')
          .where('post.author = :author OR post.category = :category', {
            author: 'sasazame-hateblo',
            category: 'RSS Import'
          })
          .getCount();

        const mtImports = totalPosts - rssImports;

        // Get recent activity
        const recentImports = await dataSource.getRepository('RssImportLog')
          .createQueryBuilder('log')
          .where('log.importedAt >= :date', { 
            date: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          })
          .getCount();

        console.log('📊 Database Statistics');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📝 Total Blog Posts: ${totalPosts}`);
        console.log(`  ├─ 📡 RSS Imports: ${rssImports}`);
        console.log(`  └─ 📄 MT Imports: ${mtImports}`);
        console.log('');
        console.log(`📡 RSS Feeds: ${totalFeeds}`);
        console.log(`📥 Total Import Logs: ${totalImports}`);
        console.log(`🕐 Recent Imports (24h): ${recentImports}`);

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error getting statistics:', error);
        process.exit(1);
      }
    });

  program
    .command('db:show <id>')
    .description('Show detailed information for a specific blog post')
    .action(async (id: string) => {
      try {
        const app = await NestFactory.createApplicationContext(AppModule, {
          logger: ['log', 'error', 'warn'],
        });

        await app.init();
        const blogService = app.get(BlogService);

        const postId = parseInt(id, 10);
        const post = await blogService.findOne(postId);

        if (!post) {
          console.error(`❌ Post with ID ${postId} not found`);
          process.exit(1);
        }

        console.log(`📝 Blog Post Details (ID: ${post.id})`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📋 Title: ${post.title}`);
        console.log(`👤 Author: ${post.author}`);
        console.log(`📂 Category: ${post.category || 'None'}`);
        console.log(`🔗 Basename: ${post.basename}`);
        console.log(`📊 Status: ${post.status}`);
        console.log(`📅 Published: ${new Date(post.publishedAt).toLocaleString('ja-JP')}`);
        console.log(`📅 Created: ${new Date(post.createdAt).toLocaleString('ja-JP')}`);
        console.log(`📅 Updated: ${new Date(post.updatedAt).toLocaleString('ja-JP')}`);
        
        if (post.summary) {
          console.log(`📖 Summary: ${post.summary}`);
          console.log(`⭐ Rating: ${post.recommendationStars || 'Not rated'}`);
        }
        
        console.log('');
        console.log('📄 Body Content:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const bodyPreview = post.body?.substring(0, 500) || 'No content';
        console.log(bodyPreview);
        
        if (post.body && post.body.length > 500) {
          console.log(`\n... (truncated, total length: ${post.body.length} characters)`);
        }

        if (post.extendedBody) {
          console.log('\n📄 Extended Body:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          const extendedPreview = post.extendedBody.substring(0, 300);
          console.log(extendedPreview);
          if (post.extendedBody.length > 300) {
            console.log(`\n... (truncated, total length: ${post.extendedBody.length} characters)`);
          }
        }

        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error showing post:', error);
        process.exit(1);
      }
    });

  program
    .command('server')
    .description('Start the API server')
    .action(async () => {
      const { NestFactory } = await import('@nestjs/core');
      const app = await NestFactory.create(AppModule);
      app.setGlobalPrefix('api');
      await app.listen(3000);
      console.log(`Application is running on: ${await app.getUrl()}`);
    });

  program.parse(process.argv);
}

bootstrap();
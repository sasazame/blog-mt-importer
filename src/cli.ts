import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MTImportService } from './modules/mt-import/services/mt-import.service';
import { MarkdownExportService } from './modules/export/services/markdown-export.service';
import { RecommendationService } from './modules/recommendation/services/recommendation.service';
import { CardGeneratorService } from './modules/recommendation/services/card-generator.service';
import { Command } from 'commander';
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
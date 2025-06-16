import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MTImportService } from './modules/mt-import/services/mt-import.service';
import { MarkdownExportService } from './modules/export/services/markdown-export.service';
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
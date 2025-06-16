import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MTImportService } from './modules/mt-import/services/mt-import.service';
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
import { Module } from '@nestjs/common';
import { BlogModule } from '../blog/blog.module';
import { MarkdownExportService } from './services/markdown-export.service';
import { ExportController } from './controllers/export.controller';

@Module({
  imports: [BlogModule],
  providers: [MarkdownExportService],
  controllers: [ExportController],
  exports: [MarkdownExportService],
})
export class ExportModule {}
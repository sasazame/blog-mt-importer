import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssFeed } from './entities/rss-feed.entity';
import { RssImportLog } from './entities/rss-import-log.entity';
import { RssImportService } from './services/rss-import.service';
import { RssParserService } from './services/rss-parser.service';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RssFeed, RssImportLog]),
    BlogModule,
  ],
  providers: [RssImportService, RssParserService],
  exports: [RssImportService],
})
export class RssImportModule {}
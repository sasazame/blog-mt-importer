import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from './modules/blog/blog.module';
import { MTImportModule } from './modules/mt-import/mt-import.module';
import { ExportModule } from './modules/export/export.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { LLMModule } from './modules/llm/llm.module';
import { RssImportModule } from './modules/rss-import/rss-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'blog_mt_importer',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    BlogModule,
    MTImportModule,
    ExportModule,
    RecommendationModule,
    LLMModule,
    RssImportModule,
  ],
})
export class AppModule {}
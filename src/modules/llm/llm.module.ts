import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from '../blog/entities/blog-post.entity';
import { GeminiService } from './services/gemini.service';
import { SummaryService } from './services/summary.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([BlogPost]),
  ],
  providers: [GeminiService, SummaryService],
  exports: [GeminiService, SummaryService],
})
export class LLMModule {}
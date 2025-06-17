import { Module } from '@nestjs/common';
import { BlogModule } from '../blog/blog.module';
import { RecommendationService } from './services/recommendation.service';
import { CardGeneratorService } from './services/card-generator.service';
import { RecommendationController } from './controllers/recommendation.controller';

@Module({
  imports: [BlogModule],
  providers: [RecommendationService, CardGeneratorService],
  controllers: [RecommendationController],
  exports: [RecommendationService, CardGeneratorService],
})
export class RecommendationModule {}
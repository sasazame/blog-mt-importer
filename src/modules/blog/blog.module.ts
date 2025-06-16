import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { BlogService } from './services/blog.service';
import { BlogController } from './controllers/blog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost])],
  providers: [BlogService],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {}
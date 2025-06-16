import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { BlogPost } from '../entities/blog-post.entity';

@Controller('blog-posts')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() blogPost: Partial<BlogPost>) {
    return this.blogService.create(blogPost);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() blogPost: Partial<BlogPost>) {
    return this.blogService.update(+id, blogPost);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
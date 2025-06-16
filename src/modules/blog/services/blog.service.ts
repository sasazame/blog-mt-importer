import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from '../entities/blog-post.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
  ) {}

  async create(blogPost: Partial<BlogPost>): Promise<BlogPost> {
    const post = this.blogPostRepository.create(blogPost);
    return this.blogPostRepository.save(post);
  }

  async createMany(blogPosts: Partial<BlogPost>[]): Promise<BlogPost[]> {
    const posts = blogPosts.map((post) => this.blogPostRepository.create(post));
    return this.blogPostRepository.save(posts);
  }

  async findAll(): Promise<BlogPost[]> {
    return this.blogPostRepository.find({
      order: {
        publishedAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<BlogPost | null> {
    return this.blogPostRepository.findOne({ where: { id } });
  }

  async findByBasename(basename: string): Promise<BlogPost | null> {
    return this.blogPostRepository.findOne({ where: { basename } });
  }

  async update(id: number, blogPost: Partial<BlogPost>): Promise<BlogPost> {
    await this.blogPostRepository.update(id, blogPost);
    return this.findOne(id) as Promise<BlogPost>;
  }

  async remove(id: number): Promise<void> {
    await this.blogPostRepository.delete(id);
  }
}
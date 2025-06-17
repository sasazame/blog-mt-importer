import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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

  async findByCategory(category: string): Promise<BlogPost[]> {
    return this.blogPostRepository.find({
      where: { category },
      order: { publishedAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<BlogPost[]> {
    return this.blogPostRepository.find({
      where: {
        publishedAt: Between(startDate, endDate),
      },
      order: { publishedAt: 'DESC' },
    });
  }

  async findWithFilter(filter: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
    status?: 'Publish' | 'Draft';
  }): Promise<BlogPost[]> {
    const where: any = {};

    if (filter.category) {
      where.category = filter.category;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.startDate && filter.endDate) {
      where.publishedAt = Between(filter.startDate, filter.endDate);
    }

    return this.blogPostRepository.find({
      where,
      order: { publishedAt: 'DESC' },
    });
  }

  async findRandom(count: number = 1): Promise<BlogPost[]> {
    const query = this.blogPostRepository
      .createQueryBuilder('post')
      .where('post.status = :status', { status: 'Publish' })
      .orderBy('RANDOM()')
      .limit(count);

    return query.getMany();
  }

  async findRandomByCategory(category: string, count: number = 1): Promise<BlogPost[]> {
    const query = this.blogPostRepository
      .createQueryBuilder('post')
      .where('post.status = :status', { status: 'Publish' })
      .andWhere('post.category = :category', { category })
      .orderBy('RANDOM()')
      .limit(count);

    return query.getMany();
  }

  async findRelated(postId: number, count: number = 5): Promise<BlogPost[]> {
    const post = await this.findOne(postId);
    if (!post) {
      return [];
    }

    // Find posts in the same category, excluding the current post
    const query = this.blogPostRepository
      .createQueryBuilder('post')
      .where('post.status = :status', { status: 'Publish' })
      .andWhere('post.id != :postId', { postId })
      .orderBy('RANDOM()')
      .limit(count);

    if (post.category) {
      query.andWhere('post.category = :category', { category: post.category });
    }

    return query.getMany();
  }

  async getCategories(): Promise<string[]> {
    const result = await this.blogPostRepository
      .createQueryBuilder('post')
      .select('DISTINCT post.category', 'category')
      .where('post.category IS NOT NULL')
      .andWhere('post.category != :empty', { empty: '' })
      .andWhere('post.status = :status', { status: 'Publish' })
      .orderBy('post.category', 'ASC')
      .getRawMany();

    return result.map(row => row.category);
  }

  async getPostCount(): Promise<number> {
    return this.blogPostRepository.count({
      where: { status: 'Publish' },
    });
  }
}
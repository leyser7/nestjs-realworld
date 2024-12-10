import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UserEntity } from '../user/user.entity';
import { ArticleResponse } from './types/articleResponse.interface';
import { UpdateArticleDto } from './dto/UpdateArticle.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
  ) {}

  async findAll(query: any): Promise<ArticleEntity[]> {
    const take = query.limit || 20;
    const skip = query.offset || 0;
    const order = { createdAt: 'DESC' };
    const where: any = {};

    if (query.author) {
      where.author = {username: query.author};
    }
    if (query.tag) {
      where.tagList = Like(`%${query.tag}%`);
    }
    return await this.articleRepository.find({ where, take, skip, ...order });
  }
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(article.title);
    article.author = currentUser;
    return this.articleRepository.save(article);
  }
  private getSlug(title: string) {
    return (
      title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '') +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
  buildArticleResponse(article: ArticleEntity): ArticleResponse {
    return { article };
  }
  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ where: { slug } });
  }
  async deleteArticle(article: ArticleEntity): Promise<ArticleEntity> {
    return await this.articleRepository.remove(article);
  }
  async updateArticle(
    article: ArticleEntity,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const allowedFields = ['title', 'description', 'body'];
    for (const key of allowedFields) {
      if (updateArticleDto[key] !== undefined) {
        article[key] = updateArticleDto[key];
      }
    }
    article.slug = this.getSlug(article.title);
    return await this.articleRepository.save(article);
  }
}

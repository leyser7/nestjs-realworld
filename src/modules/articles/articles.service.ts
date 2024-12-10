import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UserEntity } from '../user/user.entity';
import { ArticleResponse } from './types/articleResponse.interface';
import { UpdateArticleDto } from './dto/UpdateArticle.dto';
import { ArticlesResponse } from './types/articlesResponse.interface';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAllArticle(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponse> {
    const take = query.limit || 20;
    const skip = query.offset || 0;
    const order = { createdAt: 'DESC' };
    const where: any = {};

    if (query.author) {
      where.author = { username: query.author };
    }
    if (query.tag) {
      where.tagList = Like(`%${query.tag}%`);
    }
    if (query.favorited) {
      where.id = In([]);
      const user = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favoriteArticles'],
      });
      if (user) {
        where.id = In(user.favoriteArticles.map((article) => article.id));
      }
    }
    let favoriteArticleIds = [];
    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favoriteArticles'],
      });
      favoriteArticleIds = currentUser.favoriteArticles.map(
        (article) => article.id,
      );
    }
    const articles = await this.articleRepository.find({
      where,
      take,
      skip,
      ...order,
    });
    const articlesWithFavorites = articles.map((article) => {
      const favorited = favoriteArticleIds.includes(article.id);
      return { ...article, favorited };
    });
    return { articles: articlesWithFavorites, articlesCount: articles.length };
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
  async findArticleBySlug(slug: string): Promise<ArticleEntity> {
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
  async addFavoriteToArticle(
    currentUser: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favoriteArticles'],
    });
    const isNotFavorited =
      user.favoriteArticles.findIndex(
        (favArticle) => favArticle.id === article.id,
      ) === -1;
    if (isNotFavorited) {
      user.favoriteArticles.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }
  async removeFavoriteFromArticle(
    currentUser: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favoriteArticles'],
    });
    const articleIndex = user.favoriteArticles.findIndex(
      (favArticle) => favArticle.id === article.id,
    );
    if (articleIndex >= 0) {
      user.favoriteArticles.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }
}

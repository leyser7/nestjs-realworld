import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { User } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/user.entity';
import { AuthGuard } from '../user/guards/auth.guard';
import { ArticleResponse } from './types/articleResponse.interface';
import { ArticlesResponse } from './types/articlesResponse.interface';
import { UpdateArticleDto } from './dto/UpdateArticle.dto';
import { BackendValidationPipe } from '../shares/backend-validation-pipe/backend-validation.pipe';
import { CreateCommentDto } from '../comment/dto/createComment.dto';
import { CommentInterface } from '../comment/types/comment.interface';
import { CommentsInterface } from '../comment/types/comments.interface';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @Get()
  async getArticles(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<ArticlesResponse> {
    return await this.articleService.findAllArticle(currentUserId, query);
  }

  @Get(':slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.findArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createArticle(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateArticle(
    @User() currentUser: UserEntity,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.findArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUser.id) {
      throw new HttpException(
        'You are not the author of this article',
        HttpStatus.FORBIDDEN,
      );
    }
    const updatedArticle = await this.articleService.updateArticle(
      article,
      updateArticleDto,
    );
    return this.articleService.buildArticleResponse(updatedArticle);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User() currentUser: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.findArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUser.id) {
      throw new HttpException(
        'You are not the author of this article',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.articleService.deleteArticle(article);
    return this.articleService.buildArticleResponse(article);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<ArticlesResponse> {
    return await this.articleService.findFeedArticle(currentUserId, query);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addFavoriteToArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const favorite = await this.articleService.addFavoriteToArticle(
      currentUserId,
      slug,
    );
    return this.articleService.buildArticleResponse(favorite);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteFavoriteFromArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const favorite = await this.articleService.removeFavoriteFromArticle(
      currentUserId,
      slug,
    );
    return this.articleService.buildArticleResponse(favorite);
  }

  @Get(':slug/comments')
  async getComments(@Param('slug') slug: string): Promise<CommentsInterface> {
    const comments = await this.articleService.findCommentsByArticleSlug(slug);
    return { comments };
  }

  @Post(':slug/comments')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createComment(
    @User() currentUser: UserEntity,
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
  ): Promise<CommentInterface> {
    const comment = await this.articleService.addCommentToArticle(
      currentUser,
      slug,
      createCommentDto,
    );
    return { comment };
  }

  @Delete(':slug/comments/:id')
  @UseGuards(AuthGuard)
  async deleteComment(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
    @Param('id') deleteCommentId: number,
  ): Promise<CommentInterface> {
    const comment = await this.articleService.deleteComment(
      currentUserId,
      deleteCommentId,
    );
    return { comment };
  }
}

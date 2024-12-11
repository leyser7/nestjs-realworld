import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticleEntity } from './article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { FollowEntity } from '../profile/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity, FollowEntity])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}

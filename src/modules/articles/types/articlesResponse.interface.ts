import { ArticleEntity } from '../article.entity';

export interface ArticlesResponse {
  articles: ArticleEntity[];
  articlesCount: number;
}

import { ArticleEntity } from '../article.entity';
type ArticleType = Omit<ArticleEntity, 'updateTimestamp'>;
export interface ArticlesResponse {
  articles: ArticleType[];
  articlesCount: number;
}

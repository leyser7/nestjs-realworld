import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TagModule } from './modules/tag/tag.module';
import { UserModule } from './modules/user/user.module';
import { config } from './config';
import { AuthMiddleware } from './modules/user/middlewares/auth/auth.middleware';
import { ArticlesModule } from './modules/articles/articles.module';

@Module({
  imports: [TypeOrmModule.forRoot(config), TagModule, UserModule, ArticlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

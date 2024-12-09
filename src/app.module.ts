import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TagModule } from './modules/tag/tag.module';
import { UserModule } from './modules/user/user.module';
import { config } from './config';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    TagModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

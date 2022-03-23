// Nest Core
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './middlewares/Logger.middleware';

// Load Entities
import { Category } from './entities/Category';
import { Comments } from './entities/Comments';
import { ImageUpload } from './entities/ImageUpload';
import { PinnedRepositories } from './entities/PinnedRepositories';
import { PinnedRepositoryCategories } from './entities/PinnedRepositoryCategories';
import { PostLike } from './entities/PostLike';
import { Posts } from './entities/Posts';
import { PostsTags } from './entities/PostsTags';
import { Tags } from './entities/Tags';
import { UserblogCustomization } from './entities/UserblogCustomization';
import { Users } from './entities/Users';
import { PostView } from './entities/PostView';

// Service
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserBlogCustomizationModule } from './user-blog-customization/user-blog-customization.module';
import { FileUploadsModule } from './file-uploads/file-uploads.module';
import { TagsModule } from './tags/tags.module';
import { CategoriesModule } from './categories/categories.module';
import { PinnedRepositoriesModule } from './pinned-repositories/pinned-repositories.module';

// ThrottlerModule
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Task
import { BullModule } from '@nestjs/bull';
import { TaskManagerModule } from './task-manager/task-manager.module';

// Cache
import { CacheManagerModule } from './cache-manager/cache-manager.module';

// Sentry
import * as Sentry from '@sentry/node';
// import * as Tracing from '@sentry/tracing';
// import { TraceMiddleware } from './middlewares/trace.middleware';
import { SentryModule } from './sentry/sentry.module';
// Load ENV
const ENV = process.env;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // NODE_ENV 가 설정되었을 경우 .env.{NODE_ENV} 설정파일을 로드합니다.
      envFilePath: !ENV.NODE_ENV ? '.env' : `.env.${ENV.NODE_ENV}`,
    }),
    SentryModule.forRoot({
      enabled: true,
      debug: false,
      dsn: ENV.SENTRY_DNS,
      environment: 'production',
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        // new Tracing.Integrations.Express()
      ],
      tracesSampleRate: 1.0,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const REDIS_HOST = configService.get<string>('REDIS_HOST', 'localhost');
        const REDIS_PORT = configService.get<number>('REDIS_PORT', 6379);
        return { redis: { host: REDIS_HOST, port: REDIS_PORT } };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: ENV.DB_HOST,
      port: +ENV.DB_PORT,
      username: ENV.DB_USERNAME,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_DATABASE,
      entities: [
        Users,
        UserblogCustomization,
        Tags,
        PostsTags,
        Posts,
        PostLike,
        PinnedRepositoryCategories,
        PinnedRepositories,
        ImageUpload,
        Comments,
        Category,
        PostView,
      ],
      synchronize: false,
      logging: true,
      keepConnectionAlive: true,
      autoLoadEntities: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 모든 인증 처리는 Oauth로 처리되기 때문에 일시적인 버스트 요청만 차단하도록 설정되었습니다
        // ttl 주기가 매우 짧기때문에 레디스 스토리지를 사용하지않도록 변경했습니다.
        const ttl = configService.get<number>('THROTTLE_TTL', 60);
        const limit = configService.get<number>('THROTTLE_LIMIT', 10);
        return { ttl: ttl, limit: limit };
      },
    }),
    PostsModule,
    AuthModule,
    UsersModule,
    CommentsModule,
    FileUploadsModule,
    UserBlogCustomizationModule,
    TagsModule,
    CategoriesModule,
    PinnedRepositoriesModule,
    UsersModule,
    CacheManagerModule,
    TaskManagerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
// Add Middleware
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Sentry.Handlers.requestHandler(), LoggerMiddleware).forRoutes('*');
    // consumer.apply(, TraceMiddleware).forRoutes('*');
  }
}

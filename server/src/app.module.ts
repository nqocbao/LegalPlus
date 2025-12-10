import { Module } from '@nestjs/common';
import { ClsModule } from 'libs/modules/cls/cls.module';
import { ConfigModule } from "libs/modules/config/config.module";
import { ConfigService } from 'libs/modules/config/config.service';
import { PrismaModule } from 'libs/modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { UserModule } from './modules/user/user.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { FeedbackModule } from './modules/feedback/feedback.module';


@Module({
  imports: [
    ClsModule,
    ConfigModule.register({
      envFilePath: './apps/core/.env',
      provider: [ConfigService],
      exports: [ConfigService],
    }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          prismaOptions: {
            log: ['error'],
          },
        };
      },
    }),
    AuthModule,
    ChatModule,
    UserModule,
    KnowledgeModule,
    FeedbackModule,
  ],
})
export class AppModule { }

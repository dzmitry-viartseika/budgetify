import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { CategoryModule } from './category/category.module';
import { FilesModule } from './files/files.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { CardsModule } from './cards/cards.module';
import { PiggyBankModule } from './piggy-bank/piggy-bank.module';
import { StatisticsService } from './statistics/statistics.service';
import { StatisticsController } from './statistics/statistics.controller';
import { StatisticsModule } from './statistics/statistics.module';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URL),
    UsersModule,
    AuthModule,
    TokensModule,
    CategoryModule,
    FilesModule,
    TransactionsModule,
    CardsModule,
    PiggyBankModule,
    StatisticsModule,
    NotificationsModule,
  ],
  controllers: [StatisticsController, NotificationsController],
  providers: [AppService, StatisticsService, NotificationsService],
})
export class AppModule {}

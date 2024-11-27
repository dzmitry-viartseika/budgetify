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
import { ObligatoryModule } from './obligatory/obligatory.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    SubscriptionModule,
    ObligatoryModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}

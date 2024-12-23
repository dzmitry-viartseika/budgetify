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
import { StatisticsModule } from './statistics/statistics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TodoModule } from './todo/todo.module';
import { API_VERSION } from './constants/api-version';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';

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
    StatisticsModule,
    NotificationsModule,
    SubscriptionModule,
    ObligatoryModule,
    HealthModule,
    TwoFactorAuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: `/${API_VERSION}/graphql`,
      autoSchemaFile: 'schema.gql',
      playground: true,
      debug: true,
      introspection: true,
    }),
    TodoModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}

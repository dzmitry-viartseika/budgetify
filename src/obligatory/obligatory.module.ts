import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Obligatory, ObligatorySchema } from './schemas/obligatory.schema';
import { ObligatoryController } from './obligatory.controller';
import { CreateObligatoryHandler } from './handlers/create-obligatory.handler';
import { UpdateObligatoryHandler } from './handlers/update-obligatory.handler';
import { DeleteObligatoryHandler } from './handlers/delete-obligatory.handler';
import { GetObligatoryHandler } from './handlers/get-obligatory.handler';
import { GetObligationsHandler } from './handlers/get-obligations.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { GetObligationsForTodayHandler } from './handlers/get-obligations-for-today-query.handler';
import { GetObligationsForTodayQuery } from './queries/get-obligations-for-today.query';
import { ObligatoryCron } from './obligatory.cron';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Obligatory.name, schema: ObligatorySchema }]),
    CqrsModule,
    TransactionsModule,
  ],
  controllers: [ObligatoryController],
  providers: [
    CreateObligatoryHandler,
    UpdateObligatoryHandler,
    DeleteObligatoryHandler,
    GetObligatoryHandler,
    GetObligationsHandler,
    GetObligationsForTodayHandler,
    GetObligationsForTodayQuery,
    ObligatoryCron,
  ],
})
export class ObligatoryModule {}

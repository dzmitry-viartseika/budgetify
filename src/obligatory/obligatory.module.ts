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

@Module({
  imports: [MongooseModule.forFeature([{ name: Obligatory.name, schema: ObligatorySchema }]), CqrsModule],
  controllers: [ObligatoryController],
  providers: [
    CreateObligatoryHandler,
    UpdateObligatoryHandler,
    DeleteObligatoryHandler,
    GetObligatoryHandler,
    GetObligationsHandler,
  ],
})
export class ObligatoryModule {}

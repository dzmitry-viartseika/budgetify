import { Module } from '@nestjs/common';
import { ObligatoryService } from './obligatory.service';
import { ObligatoryController } from './obligatory.controller';

@Module({
  providers: [ObligatoryService],
  controllers: [ObligatoryController],
})
export class ObligatoryModule {}

import { Module } from '@nestjs/common';
import { PiggyBankService } from './piggy-bank.service';
import { PiggyBankController } from './piggy-bank.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PiggyBankSchema } from './schemas/piggy-bank.schema';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'PiggyBank', schema: PiggyBankSchema }]), CardsModule],
  providers: [PiggyBankService],
  controllers: [PiggyBankController],
})
export class PiggyBankModule {}

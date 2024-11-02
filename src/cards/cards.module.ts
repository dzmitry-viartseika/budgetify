import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './schemas/card.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Card', schema: CardSchema }]), UsersModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }])],
})
export class CardsModule {}

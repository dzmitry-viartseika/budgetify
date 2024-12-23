import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CurrencyEnum } from '../../types/enums/currency.enum';

@Schema()
export class Card extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: CurrencyEnum, default: CurrencyEnum.USD })
  currency: CurrencyEnum;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);

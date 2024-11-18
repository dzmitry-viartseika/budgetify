import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PiggyBankDocument = PiggyBank & Document;

@Schema()
export class PiggyBank extends Document {
  @Prop({ required: true })
  goal: string;

  @Prop({ required: true, default: 0 })
  goalAmount: number;

  @Prop({ required: true, default: 0 })
  savedAmount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  balance: number;

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  cardId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;
}

export const PiggyBankSchema = SchemaFactory.createForClass(PiggyBank);

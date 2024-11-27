import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema()
export class Subscription {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  categories: string[];

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  paymentStartDate: Date;

  @Prop({ required: true })
  paymentEndDate: Date;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  cardId: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

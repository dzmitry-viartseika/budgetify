import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Card extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  balance: number;

  @Prop({ required: true })
  currency: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);

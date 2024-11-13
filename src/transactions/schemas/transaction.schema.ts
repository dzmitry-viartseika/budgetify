import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';
import { Types } from 'mongoose';
import { CategoryTypeEnum } from '../../types/enums/category-type.enum';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  cardId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  payee: string;

  @Prop()
  files: string[];

  @Prop({ required: true })
  categories: string[];

  @Prop({ required: true, min: 0 })
  amount: string;

  @Prop({ required: true, enum: CategoryTypeEnum, default: CategoryTypeEnum.EXPENSE })
  type: CategoryTypeEnum;

  @Prop({ required: true })
  paymentDate: Date;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';
import { Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CategoryDocument = Category & Document;
export type CategoryType = 'Expense' | 'Income';


@Schema()
export class Category extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['Expense', 'Income'], default: 'Expense' })
  type: CategoryType;

  @Prop({default: now()})
  createdAt: Date;

  @Prop({default: now()})
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
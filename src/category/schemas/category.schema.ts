import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';
import { Types } from 'mongoose';
import { CategoryTypeEnum } from '../../types/enums/category-type.enum';

export type CategoryDocument = Category & Document;

@Schema()
export class Category extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: CategoryTypeEnum, default: CategoryTypeEnum.EXPENSE })
  type: CategoryTypeEnum;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now, Types } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Expose()
  @Prop({ required: true, unique: true })
  email: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @Expose()
  @Prop()
  lastName?: string;

  @Expose()
  @Prop()
  firstName?: string;

  @Expose()
  @Prop()
  avatar?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  cards: Types.ObjectId[];

  @Expose()
  @Prop({ default: now() })
  createdAt: Date;

  @Expose()
  @Prop({ default: now() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

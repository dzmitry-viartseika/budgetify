import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';
import { RolesEnum } from '../../types/enums/roles.enum';

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

  @Expose()
  @Prop({ default: now() })
  createdAt: Date;

  @Expose()
  @Prop({ default: now() })
  updatedAt: Date;

  @Exclude()
  @Prop({
    type: String,
    default: RolesEnum.USER,
    required: true,
    immutable: true,
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

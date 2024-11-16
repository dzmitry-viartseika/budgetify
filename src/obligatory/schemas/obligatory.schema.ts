// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, now } from 'mongoose';
// import { Types } from 'mongoose';
//
// export type ObligatoryDocument = Obligatory & Document;
//
// @Schema()
// export class Obligatory extends Document {
//   @Prop({ required: true })
//   title: string;
//
//   @Prop({ required: true })
//   amount: number;
//
//   @Prop({ required: true })
//   paymentStartDate: Date;
//
//   @Prop({ required: true })
//   paymentEndDate: Date;
//
//   @Prop()
//   description: string;
//
//   @Prop({ type: Types.ObjectId, ref: 'User', required: true })
//   userId: string;
//
//   @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
//   cardId: string;
// }
//
// export const ObligatorySchema = SchemaFactory.createForClass(Obligatory);

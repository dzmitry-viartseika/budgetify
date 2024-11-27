import { Schema, Document } from 'mongoose';

export const TransactionSchema = new Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
});

export interface Transaction extends Document {
  userId: string;
  amount: number;
  category: string;
  date: Date;
}

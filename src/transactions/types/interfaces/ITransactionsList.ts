import { Transaction } from '../../schemas/transaction.schema';

export interface ITransactionsList {
  data: Transaction[];
  total: number;
  totalPages: number;
  currentPage: number;
}

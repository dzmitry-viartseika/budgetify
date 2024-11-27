import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './types/types';

@Injectable()
export class StatisticsService {
  constructor(@InjectModel('Transaction') private readonly transactionModel: Model<Transaction>) {}

  async getCategoryStatistics(userId: string, startDate: Date, endDate: Date) {
    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          paymentDate: { $gte: startDate, $lte: endDate },
          $expr: { $eq: [{ $toLower: '$type' }, 'expense'] },
        },
      },
      {
        $unwind: '$categories',
      },
      {
        $group: {
          _id: '$categories',
          totalAmount: { $sum: { $toDouble: '$amount' } },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    const totalExpenses = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

    return {
      totalExpenses,
      categories: transactions.map(t => ({
        category: t._id,
        amount: t.totalAmount,
        percentage: ((t.totalAmount / totalExpenses) * 100).toFixed(2) + '%',
      })),
    };
  }

  async getMonthlyStatistics(userId: string, paymentStartDate: Date, paymentEndDate: Date) {
    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          paymentDate: { $gte: paymentStartDate, $lte: paymentEndDate },
          $expr: { $eq: [{ $toLower: '$type' }, 'expense'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Income'] }, { $toDouble: '$amount' }, 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Expense'] }, { $toDouble: '$amount' }, 0],
            },
          },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return transactions.map(t => {
      const economy = t.totalIncome - t.totalExpenses;
      const economyPercentage = t.totalIncome > 0 ? ((economy / t.totalIncome) * 100).toFixed(2) + '%' : '0%';

      return {
        month: `${t._id.month}/${t._id.year}`,
        income: t.totalIncome,
        expenses: Math.abs(t.totalExpenses),
        economy,
        economyPercentage,
      };
    });
  }
}

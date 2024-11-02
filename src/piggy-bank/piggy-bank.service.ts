import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PiggyBank } from './schemas/piggy-bank.schema';
import { Card } from '../cards/schemas/card.schema';
import { CreatePiggyBankDto } from './dto/create-piggy-bank.dto';
import { request } from 'express';

@Injectable()
export class PiggyBankService {
  private readonly logger = new Logger(PiggyBank.name);
  constructor(
    @InjectModel(PiggyBank.name) private piggyBankModel: Model<PiggyBank>,
    @InjectModel(Card.name) private cardModel: Model<Card>
  ) {}

  async create(user, piggyBankData: CreatePiggyBankDto): Promise<CreatePiggyBankDto> {
    const card = await this.cardModel.findById(piggyBankData.cardId);

    if (!card) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Piggy bank with ID ${piggyBankData.cardId} not found`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    if (card.userId !== user.id) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'You do not have permission to create a piggy bank for this card',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    const savedPiggyBank = new this.piggyBankModel(piggyBankData);
    await savedPiggyBank.save();

    await this.cardModel.findByIdAndUpdate(piggyBankData.cardId, { $inc: { balance: -piggyBankData.savedAmount } });

    this.logger.verbose(`User added new piggy bank ${PiggyBank.name} successfully`);
    return savedPiggyBank;
  }

  async findAll(user): Promise<PiggyBank[]> {
    const piggyBanks = await this.piggyBankModel.find().exec();
    const userPiggyBanks = [];

    for (const piggyBank of piggyBanks) {
      const card = await this.cardModel.findById(piggyBank.cardId).exec();

      if (!card) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `Card with ID ${piggyBank.cardId} not found`,
            path: request.url,
          },
          HttpStatus.NOT_FOUND
        );
      }

      if (card.userId === user.id) {
        userPiggyBanks.push(piggyBank);
      }
    }

    return userPiggyBanks;
  }

  async findOne(user, id: string): Promise<PiggyBank> {
    const piggyBank = await this.piggyBankModel.findById(id);
    if (!piggyBank) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `PiggyBank with ID ${id} not found`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    const { cardId } = piggyBank;

    const card = await this.cardModel.findById(cardId);

    if (!card) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Card with ID ${cardId} not found`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    if (card.userId !== user.id) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'You are not allowed to modify this piggy bank',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    return piggyBank;
  }

  async update(user, id: string, updateData): Promise<PiggyBank> {
    const piggyBank = await this.piggyBankModel.findById(id).exec();

    if (!piggyBank) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `PiggyBank with ID ${id} not found`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    const card = await this.cardModel.findById(piggyBank.cardId).exec();

    if (!card || card.userId !== user.id) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'You are not allowed to modify this piggy bank',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    return this.piggyBankModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(user, id: string): Promise<PiggyBank> {
    const piggyBankToDelete = await this.piggyBankModel.findById(id);

    if (!piggyBankToDelete) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `PiggyBank with ID ${id} not found`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    const { savedAmount, cardId } = piggyBankToDelete;

    const card = await this.cardModel.findById(cardId);

    if (!card) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `PiggyBank with ID ${id} not found`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    if (card.userId !== user.id) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'You are not allowed to modify this piggy bank',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    const deletedPiggyBank = await this.piggyBankModel.findByIdAndDelete(id);

    await this.cardModel.findByIdAndUpdate(cardId, { $inc: { balance: savedAmount } });

    return deletedPiggyBank;
  }
}

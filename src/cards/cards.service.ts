import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card } from './schemas/card.schema';
import { CreateCardDto } from './dto/create-card.dto';
import { User } from '../users/schemas/user.schema';
import { request } from 'express';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(Card.name);
  constructor(
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(user, cardData: CreateCardDto): Promise<Card> {
    const createdCard = new this.cardModel({
      ...cardData,
      userId: user.id,
    });

    const savedCard = await createdCard.save();

    this.logger.verbose(`User added new card ${Card.name} successfully`);
    return savedCard;
  }

  async findAll(user): Promise<Card[]> {
    const cards = await this.cardModel.find({ userId: user.id }).exec();
    this.logger.verbose(`fetched cards: ${cards}`);
    return cards;
  }

  async findOne(user, id: string): Promise<Card> {
    const selectedCard = await this.cardModel.findOne({ userId: user.id, _id: id }).exec();

    if (!selectedCard) {
      this.logger.error(`Card with id ${selectedCard.id} is not exists`);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Current card is not exists',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    this.logger.verbose(`User fetched card with ID ${id} successfully`);
    return selectedCard;
  }

  async update(user, id: string, updateData): Promise<Card> {
    const updatedCard = await this.cardModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!updatedCard) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Card with ID ${id} not found`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    this.logger.verbose(`User updated card ${id} successfully`);
    return updatedCard;
  }

  async remove(user, id: string): Promise<Card> {
    const cardObjectId = new Types.ObjectId(id);

    const deletedCard = await this.cardModel.findByIdAndDelete(cardObjectId).exec();

    if (!deletedCard) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Card with ID ${id} not found`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    // const userUpdateResult = await this.userModel
    //   .findOneAndUpdate({ _id: user.id, cards: cardObjectId }, { $pull: { cards: cardObjectId } }, { new: true })
    //   .exec();
    //
    // if (!userUpdateResult) {
    //   this.logger.warn(`Card ID ${id} not found in user ${user.id}'s cards array`);
    // } else {
    //   this.logger.verbose(`User ${user.id} removed card ${id} successfully`);
    // }
    //
    return deletedCard;
  }
}

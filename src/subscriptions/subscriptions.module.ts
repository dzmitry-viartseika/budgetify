import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionController } from './subscriptions.controller';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { CreateSubscriptionHandler } from './handlers/create-subscription.handler';
import { UpdateSubscriptionHandler } from './handlers/update-subscription.handler';
import { DeleteSubscriptionHandler } from './handlers/delete-subscription.handler';
import { GetSubscriptionHandler } from './handlers/get-subscription.handler';
import { GetSubscriptionsHandler } from './handlers/get-subscriptions.handler';

@Module({
  imports: [MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]), CqrsModule],
  controllers: [SubscriptionController],
  providers: [
    CreateSubscriptionHandler,
    UpdateSubscriptionHandler,
    DeleteSubscriptionHandler,
    GetSubscriptionHandler,
    GetSubscriptionsHandler,
  ],
})
export class SubscriptionModule {}

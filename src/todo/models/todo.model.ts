import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType() // Модель Todo должна быть декорирована с помощью @ObjectType()
export class Todo {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;
}

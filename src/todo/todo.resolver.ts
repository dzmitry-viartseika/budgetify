import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TodoService } from './todo.service';
import { Todo } from './models/todo.model';

@Resolver(() => Todo)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Query(() => [Todo])
  async getTodos() {
    return this.todoService.findAll();
  }

  @Query(() => Todo, { name: 'getTodoById' })
  async getTodoById(@Args('id', { type: () => String }) id: string) {
    return this.todoService.getById(id);
  }

  @Mutation(() => Todo)
  async createTodo(@Args('title') title: string, @Args('description') description: string) {
    return this.todoService.create({ title, description });
  }

  @Mutation(() => Todo)
  async deleteTodo(@Args('id', { type: () => String }) id: string) {
    return this.todoService.delete(id);
  }

  @Mutation(() => Todo)
  async updateTodo(@Args('id') id: string, @Args('title') title: string, @Args('description') description: string) {
    return this.todoService.update(id, title, description);
  }
}

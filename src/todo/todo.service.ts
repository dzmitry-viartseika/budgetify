import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './shemas/todo.schema';
import { ITodo } from './types/types';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  async findAll(): Promise<Todo[]> {
    return this.todoModel.find().exec();
  }

  async create(todo: ITodo): Promise<ITodo> {
    const newTodo = new this.todoModel(todo);
    return newTodo.save();
  }

  async getById(id: string): Promise<Todo> {
    const todo = await this.todoModel.findById({ _id: id }).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async delete(id: string): Promise<Todo> {
    const todo = await this.todoModel.findByIdAndDelete(id).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async update(id: string, title: string, description: string): Promise<Todo> {
    const todo = await this.todoModel.findById({ _id: id }).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return this.todoModel.findByIdAndUpdate(id, { title, description }, { new: true }).exec();
  }
}

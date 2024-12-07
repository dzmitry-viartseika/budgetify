import { Test, TestingModule } from '@nestjs/testing';
import { TodoResolver } from './todo.resolver';
import { TodoService } from './todo.service';
import { NotFoundException } from '@nestjs/common';

// Mock data
const mockTodo = {
  id: '63f28a7e5e763b2c12f55689',
  title: 'Test Todo',
  description: 'This is a test todo',
};

describe('TodoResolver', () => {
  let resolver: TodoResolver;
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoResolver,
        {
          provide: TodoService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockTodo]),
            getById: jest.fn().mockResolvedValue(mockTodo),
            create: jest.fn().mockResolvedValue(mockTodo),
            delete: jest.fn().mockResolvedValue(mockTodo),
            update: jest.fn().mockResolvedValue(mockTodo),
          },
        },
      ],
    }).compile();

    resolver = module.get<TodoResolver>(TodoResolver);
    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getTodos', () => {
    it('should return an array of todos', async () => {
      const result = await resolver.getTodos();
      expect(result).toEqual([mockTodo]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getTodoById', () => {
    it('should return a todo by ID', async () => {
      const result = await resolver.getTodoById('63f28a7e5e763b2c12f55689');
      expect(result).toEqual(mockTodo);
      expect(service.getById).toHaveBeenCalledWith('63f28a7e5e763b2c12f55689');
    });

    it('should throw NotFoundException if todo is not found', async () => {
      service.getById = jest.fn().mockRejectedValue(new NotFoundException('Todo not found'));
      await expect(resolver.getTodoById('63f28a7e5e763b2c12f55689')).rejects.toThrowError(NotFoundException);
    });
  });

  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const newTodo = { title: 'New Todo', description: 'New Description' };
      const result = await resolver.createTodo(newTodo.title, newTodo.description);
      expect(result).toEqual(mockTodo);
      expect(service.create).toHaveBeenCalledWith(newTodo);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo by ID', async () => {
      const result = await resolver.deleteTodo('63f28a7e5e763b2c12f55689');
      expect(result).toEqual(mockTodo);
      expect(service.delete).toHaveBeenCalledWith('63f28a7e5e763b2c12f55689');
    });

    it('should throw NotFoundException if todo is not found for deletion', async () => {
      service.delete = jest.fn().mockRejectedValue(new NotFoundException('Todo not found'));
      await expect(resolver.deleteTodo('63f28a7e5e763b2c12f55689')).rejects.toThrowError(NotFoundException);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo by ID', async () => {
      const updatedTodo = { title: 'Updated Todo', description: 'Updated Description' };
      const result = await resolver.updateTodo('63f28a7e5e763b2c12f55689', updatedTodo.title, updatedTodo.description);
      expect(result).toEqual(mockTodo);
      expect(service.update).toHaveBeenCalledWith(
        '63f28a7e5e763b2c12f55689',
        updatedTodo.title,
        updatedTodo.description
      );
    });

    it('should throw NotFoundException if todo is not found for updating', async () => {
      service.update = jest.fn().mockRejectedValue(new NotFoundException('Todo not found'));
      await expect(
        resolver.updateTodo('63f28a7e5e763b2c12f55689', 'Updated Title', 'Updated Description')
      ).rejects.toThrowError(NotFoundException);
    });
  });
});

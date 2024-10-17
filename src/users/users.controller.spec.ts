import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const DUMMY_USER = {
  id: '1',
  password: 'test12345',
  email: 'test@email.com',
};

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined User controller', () => {
    expect(controller).toBeDefined();
  });

  it('should return created user', async () => {
    const createUserDto = {
      password: 'test12345',
      email: 'test@email.com',
    } as CreateUserDto;

    jest.spyOn(mockUsersService, 'create').mockReturnValue(DUMMY_USER);

    const result = await controller.create(createUserDto);

    expect(mockUsersService.create).toBeCalled();
    expect(mockUsersService.create).toBeCalledWith(createUserDto);
    expect(result).toEqual(DUMMY_USER);
  });

  it('should return all created users', async () => {
    const USERS = [DUMMY_USER];
    jest.spyOn(mockUsersService, 'findAll').mockReturnValue(USERS);

    const result = await controller.findAll();

    expect(result).toEqual(USERS);
    expect(mockUsersService.findAll).toBeCalled();
  });

  it('should return current user by id', async () => {
    jest.spyOn(mockUsersService, 'findById').mockReturnValue(DUMMY_USER);

    const result = await controller.findById(DUMMY_USER.id);

    expect(result).toEqual(DUMMY_USER);
    expect(mockUsersService.findById).toBeCalled();
    expect(mockUsersService.findById).toBeCalledWith(DUMMY_USER.id);
  });

  it('should update current user', async () => {
    const updateUserDto = {
      password: 'updatedPassword123',
      email: 'test@email.com',
    } as UpdateUserDto;

    jest.spyOn(mockUsersService, 'update').mockReturnValue(DUMMY_USER);

    const result = await controller.update(DUMMY_USER.id, updateUserDto);

    expect(result).toEqual(DUMMY_USER);
    expect(mockUsersService.update).toBeCalled();
    expect(mockUsersService.update).toBeCalledWith(DUMMY_USER.id, updateUserDto);
  });

  it('should be removed current user', async () => {
    jest.spyOn(mockUsersService, 'remove').mockReturnValue(DUMMY_USER);

    const result = await controller.remove(DUMMY_USER.id);

    expect(result).toEqual(DUMMY_USER);
    expect(mockUsersService.remove).toBeCalled();
    expect(mockUsersService.remove).toBeCalledWith(DUMMY_USER.id);
  });
});

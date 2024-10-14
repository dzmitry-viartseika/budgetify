import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

const DUMMY_USER = {
  id: '1',
  password: 'test12345',
  email: 'test@email.com',
};

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findByEmail: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersService,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should create a new user', async () => {
    const createUserDto = {
      password: 'test12345',
      email: 'test@email.com',
    };


    jest.spyOn(mockUserRepository, 'create').mockReturnValue(DUMMY_USER);

    const result = await service.create(createUserDto);

    expect(mockUserRepository.create).toBeCalled();
    expect(mockUserRepository.create).toBeCalledWith(createUserDto);

    expect(result).toEqual(DUMMY_USER);
  });

  it('should return exist user', async() => {
    jest.spyOn(mockUserRepository, 'findByEmail').mockReturnValue(DUMMY_USER);
    const result = await service.findByEmail(DUMMY_USER.email);
    expect(result).toEqual(DUMMY_USER);
    expect(mockUserRepository.findByEmail).toBeCalled();
  })

  it('should return list of users', async () => {
    const USERS = [DUMMY_USER];
    jest.spyOn(mockUserRepository, 'findAll').mockReturnValue(USERS);

    const result = await service.findAll();

    expect(result).toEqual(USERS);
    expect(mockUserRepository.findAll).toBeCalled();
  });

  it('should find current user by id', async () => {
    jest.spyOn(mockUserRepository, 'findById').mockReturnValue(DUMMY_USER);

    const result = await service.findById(DUMMY_USER.id);

    expect(result).toEqual(DUMMY_USER);
    expect(mockUserRepository.findById).toBeCalled();
  });

  it('should update current user', async () => {
    const updateUserDto = {
      password: 'updatedPassword123',
      email: 'test@email.com',
    } as UpdateUserDto;

    jest.spyOn(mockUserRepository, 'update').mockReturnValue(DUMMY_USER);
     const result = await service.update(DUMMY_USER.id, updateUserDto);

    expect(result).toEqual(DUMMY_USER);
    expect(mockUserRepository.update).toBeCalled();
    expect(mockUserRepository.update).toBeCalledWith(DUMMY_USER.id, updateUserDto);
  })

  it('should find current user by id', async () => {
    jest.spyOn(mockUserRepository, 'remove').mockReturnValue(DUMMY_USER);

    const result = await service.remove(DUMMY_USER.id);

    expect(result).toEqual(DUMMY_USER);
    expect(mockUserRepository.remove).toBeCalled();
    expect(mockUserRepository.remove).toBeCalledWith(DUMMY_USER.id);
  });
});
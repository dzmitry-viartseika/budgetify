import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
  };

  const mockAccessTokenGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRefreshTokenGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AccessTokenGuard,
          useValue: mockAccessTokenGuard,
        },
        {
          provide: RefreshTokenGuard,
          useValue: mockRefreshTokenGuard,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController) as any;
  });

  describe('signup', () => {
    it('should register a user successfully', async () => {
      const createUserDto: CreateAuthDto = { email: 'test@example.com', password: 'password' };
      mockAuthService.signUp.mockResolvedValue(createUserDto);

      expect(await authController.signup(createUserDto)).toEqual(createUserDto);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw error on invalid input', async () => {
      const createUserDto: CreateAuthDto = { email: '', password: '' };
      mockAuthService.signUp.mockRejectedValue(new Error('Custom Http Exception'));

      await expect(authController.signup(createUserDto)).rejects.toThrow('Custom Http Exception');
    });
  });

  describe('signin', () => {
    it('should login user successfully', async () => {
      const loginData: CreateAuthDto = { email: 'test@example.com', password: 'password' };
      mockAuthService.signIn.mockResolvedValue({ accessToken: 'token' });

      expect(await authController.signin(loginData)).toEqual({ accessToken: 'token' });
      expect(mockAuthService.signIn).toHaveBeenCalledWith(loginData);
    });

    it('should throw error on invalid credentials', async () => {
      const loginData: CreateAuthDto = { email: 'test@example.com', password: 'wrong' };
      mockAuthService.signIn.mockRejectedValue(new Error('Custom Http Exception'));

      await expect(authController.signin(loginData)).rejects.toThrow('Custom Http Exception');
    });
  });
});

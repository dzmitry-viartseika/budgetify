import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { RefreshTokenGuard } from '../guards/refreshToken.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

  // describe('logout', () => {
  //   it('should log out a user successfully', async () => {
  //     const req: Request = { user: { sub: 'userId' } } as Request;
  //     await authController.logout(req);
  //     expect(mockAuthService.logout).toHaveBeenCalledWith(req.user['sub']);
  //   });
  //
  //   it('should handle logout error', async () => {
  //     const req: Request = { user: { sub: 'userId' } } as Request;
  //     mockAuthService.logout.mockImplementation(() => {
  //       throw new Error('Logout failed');
  //     });
  //
  //     await expect(authController.logout(req)).rejects.toThrow('Logout failed');
  //   });
  // });

  // describe('refreshTokens', () => {
  //   it('should refresh tokens successfully', async () => {
  //     const req: Request = { user: { sub: 'userId', refreshToken: 'refreshToken' } } as Request;
  //     const result = { accessToken: 'newAccessToken' };
  //     mockAuthService.refreshTokens.mockResolvedValue(result);
  //
  //     expect(await authController.refreshTokens(req)).toEqual(result);
  //     expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(req.user['sub'], req.user['refreshToken']);
  //   });
  //
  //   it('should throw error on invalid refresh token', async () => {
  //     const req: Request = { user: { sub: 'userId', refreshToken: 'invalidToken' } } as Request;
  //     mockAuthService.refreshTokens.mockRejectedValue(new Error('Unauthorized: Invalid or expired refresh token'));
  //
  //     await expect(authController.refreshTokens(req)).rejects.toThrow('Unauthorized: Invalid or expired refresh token');
  //   });
  // });
});
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

const mockUserService = {
  create: jest.fn(),
};

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call userService.create with the correct parameters', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', name: 'Test User', password: 'password123' };

      mockUserService.create.mockResolvedValue(createUserDto);

      const result = await controller.signup(createUserDto);

      expect(result).toBe(createUserDto);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should return access token if credentials are valid', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const user = { email: 'test@example.com', name: 'Test User', password: 'hashedpassword' };
      const accessToken = { access_token: 'token' };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(accessToken);

      const result = await controller.login(loginDto);

      expect(result).toBe(accessToken);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });
});

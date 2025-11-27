import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'USER' as any,
    isBanned: false,
    bannedAt: null,
    bannedUntil: null,
    banReason: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.validateUser('1');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.validateUser('999');

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: '999' } });
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error('DB Error'));

      await expect(service.validateUser('1')).rejects.toThrow('DB Error');
    });
  });

  describe('getUserFromToken', () => {
    it('should return user when token is valid', async () => {
      const token = 'valid.jwt.token';
      const payload = { userId: '1' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.getUserFromToken(token);

      expect(result).toEqual(mockUser);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null when token is invalid', async () => {
      const token = 'invalid.token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.getUserFromToken(token);

      expect(result).toBeNull();
      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return null when token is expired', async () => {
      const token = 'expired.token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = await service.getUserFromToken(token);

      expect(result).toBeNull();
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should return null when user not found after token verification', async () => {
      const token = 'valid.jwt.token';
      const payload = { userId: '999' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.getUserFromToken(token);

      expect(result).toBeNull();
      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: '999' } });
    });
  });
});

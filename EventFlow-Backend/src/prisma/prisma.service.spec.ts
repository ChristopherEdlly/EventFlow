import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    if (service) {
      await service.$disconnect();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service.$connect).toBeDefined();
    expect(service.$disconnect).toBeDefined();
    expect(service.$transaction).toBeDefined();
  });

  it('should have user model', () => {
    expect(service.user).toBeDefined();
  });

  it('should have event model', () => {
    expect(service.event).toBeDefined();
  });

  it('should have guest model', () => {
    expect(service.guest).toBeDefined();
  });

  describe('lifecycle hooks', () => {
    it('should connect on module init', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });

    it('should have enableShutdownHooks method', () => {
      expect(service.enableShutdownHooks).toBeDefined();
      expect(typeof service.enableShutdownHooks).toBe('function');
    });
  });
});

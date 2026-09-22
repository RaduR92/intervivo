import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '@db/prisma.service.js';
import { RedisService } from '@redis/redis.service.js';
import { Public } from '@auth/decorators/public.decorator.js';

@ApiTags('health')
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check Postgres and Redis connectivity' })
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    const pong = await this.redis.ping();
    return { postgres: 'ok', redis: pong };
  }
}

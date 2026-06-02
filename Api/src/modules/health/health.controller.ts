import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../shared/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOkResponse({ description: 'API health status' })
  getHealth() {
    return { status: 'ok', service: 'eventstan-api', timestamp: new Date().toISOString() };
  }

  @Get('db')
  @ApiOkResponse({ description: 'PostgreSQL connection health status' })
  async getDatabaseHealth() {
    const result = await this.prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;
    return {
      status: result[0]?.ok === 1 ? 'ok' : 'error',
      database: 'postgresql',
      timestamp: new Date().toISOString(),
    };
  }
}

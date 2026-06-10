import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { HealthCheckResponse } from '@food-delivery/types';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(@Inject('DB') private db: NeonHttpDatabase<typeof schema>) {}

  @Get('db-test')
  @ApiOperation({ summary: 'Test database connection and retrieve all users' })
  @ApiResponse({ status: 200, description: 'List of all users in the system' })
  async dbTest() {
    const result = await this.db.select().from(schema.users);
    return { users: result, count: result.length };
  }

  @Get('health') // /api/health
  @ApiOperation({ summary: 'Check health status of the backend API' })
  @ApiResponse({ status: 200, description: 'Application is running successfully' })
  health(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }
}

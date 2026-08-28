import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload, UserRole } from '@food-delivery/types';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@ApiTags('Driver')
@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@ApiBearerAuth('JWT-auth')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Patch('online')
  @ApiOperation({ summary: 'Toggle driver online/offline availability status' })
  @ApiResponse({ status: 200, description: 'Online status toggled successfully' })
  toggleOnline(@Request() req: AuthRequest) {
    return this.driverService.toggleOnline(req.user.sub);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current driver availability and online status' })
  @ApiResponse({ status: 200, description: 'Driver status details returned successfully' })
  getStatus(@Request() req: AuthRequest) {
    return this.driverService.getStatus(req.user.sub);
  }

  @Post('orders/:id/decline')
  @ApiOperation({ summary: 'Decline a delivery order offer' })
  @ApiResponse({ status: 201, description: 'Order declined successfully' })
  declineOrder(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.driverService.declineOrder(id, req.user.sub);
  }
  @Post('orders/:id/accept')
  @ApiOperation({ summary: 'Accept a delivery order offer' })
  @ApiResponse({ status: 201, description: 'Order accepted successfully' })
  acceptOrder(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.driverService.acceptOrder(id, req.user.sub);
  }
}

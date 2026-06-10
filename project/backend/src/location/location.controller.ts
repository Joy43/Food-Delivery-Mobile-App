import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('location')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get(':orderId')
  getDriverLocation(@Param('orderId') orderId: string) {
    return this.locationService.getDriverLocation(orderId);
  }
}

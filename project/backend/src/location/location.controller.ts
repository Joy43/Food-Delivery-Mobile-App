import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Location')
@Controller('location')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get(':orderId')
  @ApiOperation({ summary: 'Get current real-time location coordinates of the driver for an order' })
  @ApiResponse({ status: 200, description: 'Coordinates returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Driver or order not found' })
  getDriverLocation(@Param('orderId') orderId: string) {
    return this.locationService.getDriverLocation(orderId);
  }
}

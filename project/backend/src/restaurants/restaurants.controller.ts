import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '@food-delivery/types';
import { UserRole } from '@food-delivery/types';
import { Request as ExpressRequest } from 'express';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@ApiTags('Restaurants')
@Controller('restaurants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Register a new restaurant profile (Restaurant Owner only)' })
  @ApiResponse({ status: 201, description: 'Restaurant profile created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Request() req: AuthRequest, @Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(req.user.sub, dto);
  }

  // ------the owner restarant-------
  @Get('mine')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Retrieve restaurant details managed by the logged-in owner' })
  @ApiResponse({ status: 200, description: 'Restaurant details returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findMine(@Request() req: AuthRequest) {
    return this.restaurantsService.findMine(req.user.sub);
  }

  // ------GET ALL Restaurants only customer -----------
  @Get()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Retrieve list of all active/registered restaurants' })
  @ApiResponse({ status: 200, description: 'List of restaurants returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Optional search query' })
  findAll(@Query('search') search?: string) {
    return this.restaurantsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single restaurant details by UUID' })
  @ApiResponse({ status: 200, description: 'Restaurant details returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Update restaurant profile details (Owner only)' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })

  update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, req.user.sub, dto);
  }
}

import {
  Body,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload, UserRole } from '@food-delivery/types';
import { UpdateStatusDto } from './dto/update-status.dto';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Customer role required)' })
  create(@Request() req: AuthRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, dto);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.DRIVER)
  @ApiOperation({ summary: 'Get list of orders belonging to the logged-in customer or driver' })
  @ApiResponse({ status: 200, description: 'List of user orders returned successfully' })
  findMine(@Request() req: AuthRequest) {
    return this.ordersService.findMyOrders(req.user.sub, req.user.role);
  }

  @Get('restaurant')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get list of orders placed at the owner\'s restaurant' })
  @ApiResponse({ status: 200, description: 'List of restaurant orders returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByRestaurant(@Request() req: AuthRequest) {
    return this.ordersService.findByRestaurant(req.user.sub);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.DRIVER)
  @ApiOperation({ summary: 'Update status of an order (e.g. prepared, delivered)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })

  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order details by UUID' })
  @ApiResponse({ status: 200, description: 'Order details returned successfully' })

  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    // pass the logged-in user so the service can enforce role-based access
    return this.ordersService.findById(id, req.user);
  }
}

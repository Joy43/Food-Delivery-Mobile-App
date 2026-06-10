import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload, UserRole } from '@food-delivery/types';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a new review for a restaurant and/or driver for an order' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid review input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  createReview(@Body() dto: CreateReviewDto, @Request() req: AuthRequest) {
    return this.reviewsService.createReview(dto, req.user.sub);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all customer reviews for a specific restaurant' })
  @ApiResponse({ status: 200, description: 'List of reviews returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getRestaurantReviews(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.getRestaurantReviews(restaurantId);
  }

  @Get('restaurant/:restaurantId/average')
  @ApiOperation({ summary: 'Get average review rating of a restaurant' })
  @ApiResponse({ status: 200, description: 'Average rating returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getRestaurantAverage(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.getRestaurantAverageRating(restaurantId);
  }

  @Get('driver/:driverId/average')
  @ApiOperation({ summary: 'Get average review rating of a driver' })
  @ApiResponse({ status: 200, description: 'Average rating returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDriverAverage(@Param('driverId') driverId: string) {
    return this.reviewsService.getDriverAverageRating(driverId);
  }

  @Get('order/:orderId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Check if an order has already been reviewed by the customer' })
  @ApiResponse({ status: 200, description: 'Boolean status indicating if reviewed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  hasReviewed(@Param('orderId') orderId: string, @Request() req: AuthRequest) {
    return this.reviewsService.hasReviewedOrder(orderId, req.user.sub);
  }
}

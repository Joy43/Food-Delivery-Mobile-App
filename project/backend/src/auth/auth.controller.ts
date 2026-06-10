import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '@food-delivery/types';

@ApiTags('Auth')
@Controller('auth') // /api/auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') // /api/auth/register
  @ApiOperation({
    summary:
      'Register a new user profile || The role of the user (CUSTOMER, DRIVER, RESTAURANT)',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully and auth token returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email already exists',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and return authentication token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated, token returned',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user details returned',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@Request() req: ExpressRequest & { user: JwtPayload }) {
    return req.user;
  }
}

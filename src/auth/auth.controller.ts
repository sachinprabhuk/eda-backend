import { Controller, Get, Post, Body, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO } from './auth.dto';
import { JWTdecoded } from '../shared/index.dto';
import { Faculty } from '../entities/Faculty.entity';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDTO: LoginDTO): Promise<any> {
    return this.authService.login(loginDTO);
  }

  @Get('auth-status')
  isAuth(@Req() req: Request): Promise<JWTdecoded | Faculty> {
    return this.authService.isAuth(req.headers.authorization);
  }
}

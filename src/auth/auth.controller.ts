import { Controller, Get, Post, Body, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO } from './auth.dto';
import { JWTdecoded } from '../shared/index.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDTO: LoginDTO): Promise<string> {
    return this.authService.login(loginDTO);
  }

  @Get('auth-status')
  isAuth(@Req() req: Request): JWTdecoded {
    return this.authService.isAuth(req.headers.authorization);
  }
}

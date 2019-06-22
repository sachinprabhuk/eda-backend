import { Controller, Get, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDTO } from './auth.dto';
import { JWTdecoded } from 'dist/auth/auth.dto';

@Controller("api/auth")
export class AuthController {

  constructor(private readonly authService: AuthService) {}

	@Post("login")
	login(@Body() loginDTO: LoginDTO): Promise<string> {
		return this.authService.login(loginDTO);
	}

	@Post("is-auth")
	isAuth(@Body('token') token: string): JWTdecoded {
		return this.authService.isAuth(token);
	}

}

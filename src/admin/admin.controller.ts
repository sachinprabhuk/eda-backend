import { Controller, Get, UseGuards, Body } from "@nestjs/common";

import { AdminAuthGuard } from "../auth/auth.guard";
import { JWTdecoded } from "../auth/auth.dto";



@Controller("api/admin")
export class AdminController {

	@Get('get-all')
	@UseGuards(AdminAuthGuard)
	getAlladmin(@Body('user') user: JWTdecoded ): JWTdecoded {
		return user;
	}

}
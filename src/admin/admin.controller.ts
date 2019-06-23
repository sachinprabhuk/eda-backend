import { Controller, Get, UseGuards, Body } from "@nestjs/common";

import { AdminAuthGuard } from "../auth/auth.guard";
import { AdminService } from "./admin.service";


@Controller("api/admin")
@UseGuards(AdminAuthGuard)
export class AdminController {

	// Note: req.body has *user* object from the AdminAuthGuard.
	constructor(private readonly adminService: AdminService) {}

	@Get('slot-selections')
	getSelections(): Promise<any> {
		return this.adminService.getSelections();
	}

}
import { Controller, Get, UseGuards, Body, Post } from "@nestjs/common";

import { AdminAuthGuard } from "../auth/auth.guard";
import { AdminService } from "./admin.service";
import { SlotDTO, FacultyDTO } from '../shared/index.dto';
import { Slot } from "../entities/Slot.entity";
import { Faculty } from "../entities/Faculty.entity";


@Controller("api/admin")
@UseGuards(AdminAuthGuard)
export class AdminController {

	// Note: req.body has *user* object from the AdminAuthGuard.
	constructor(private readonly adminService: AdminService) {}

	@Get('slot-selections')
	getSelections(): Promise<any> {
		return this.adminService.getSelections();
	}

	@Post('slot')
	addSlot(@Body('slot') slot: SlotDTO): Promise<Slot> {
		return this.adminService.addSlot(slot);
	}

	@Post('faculty')
	addFaculty(@Body('faculty') faculty: FacultyDTO): Promise<Faculty> {
		return this.adminService.addFaculty(faculty);
	}

	@Get('slots')
	getSlots(): Promise<Slot[]> {
		return this.adminService.getSlots();
	}
}
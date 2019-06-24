import { Controller, Get, UseGuards, Body, Post, Delete } from "@nestjs/common";

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

	@Delete("faculty")
	async deleteFaculty(@Body('facultyID') facID: string): Promise<Faculty> {
		return this.adminService.deleteFaculty(facID);
	}

	@Delete("slot")
	async deleteSlot(@Body('slotID') slotID: string): Promise<Slot> {
		return this.adminService.deleteSlot(slotID);
	}

	@Delete("all-test")
	async deleteAll(): Promise<string> {
		return this.adminService.clearAll();
	}

}
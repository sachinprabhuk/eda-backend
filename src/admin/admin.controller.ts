import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  Delete,
  Param,
  Query,
} from '@nestjs/common';

import { AdminAuthGuard } from '../auth/auth.guard';
import { AdminService } from './admin.service';
import { SlotDTO, FacultyDTO } from '../shared/index.dto';
import { Slot } from '../entities/Slot.entity';
import { Faculty } from '../entities/Faculty.entity';

@Controller('api/admin')
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

  @Delete('faculty')
  async deleteFaculty(@Body('facultyID') facID: string): Promise<Faculty> {
    return this.adminService.deleteFaculty(facID);
  }

  @Delete('slot')
  async deleteSlot(@Body('slotID') slotID: string): Promise<Slot> {
    return this.adminService.deleteSlot(slotID);
  }

  @Get('pending-faculty')
  async pendingFaculty(@Query('designation') desig: number): Promise<Faculty[]> {
    return this.adminService.pendingFaculty(desig);
  }

  @Get('report-meta')
  async reportMeta(): Promise<any> {
    return this.adminService.reportMeta();
  }

  @Get('report')
  async report(
    @Query('type') type: string,
    @Query('date') date: Date,
  ): Promise<any> {
    return this.adminService.report(date, type);
  }

  // for tests
  @Delete('all-test')
  async deleteAll(): Promise<string> {
    return this.adminService.clearAll();
  }

  @Get('slots')
  getSlots(): Promise<Slot[]> {
    return this.adminService.getSlots();
  }
}

import {
  Controller,
  Get,
  Body,
  Post,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AdminAuthGuard } from '../auth/auth.guard';
import { SlotDTO, FacultyDTO } from '../shared/index.dto';
import { Slot, Faculty } from '../entities';
import {
  GetAdminService,
  PostAdminService,
  DeleteAdminService,
  UtilAdminService,
} from './services';
@Controller('api/admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  // Note: req.body has *user* object from the AdminAuthGuard.
  constructor(
    private readonly getService: GetAdminService,
    private readonly postService: PostAdminService,
    private readonly deleteService: DeleteAdminService,
    private readonly utilService: UtilAdminService,
  ) {}

  @Get('slot-selections')
  getSelections(): Promise<any> {
    return this.getService.getSelections();
  }

  @Post('slot')
  addSlot(@Body('slot') slot: SlotDTO): Promise<Slot> {
    return this.postService.addSlot(slot);
  }

  @Post('faculty')
  addFaculty(@Body('faculty') faculty: FacultyDTO): Promise<Faculty> {
    return this.postService.addFaculty(faculty);
  }

  @Delete('faculty')
  deleteFaculty(@Body('facultyID') facID: string): Promise<Faculty> {
    return this.deleteService.deleteFaculty(facID);
  }

  @Delete('slot')
  deleteSlot(@Body('slotID') slotID: string): Promise<Slot> {
    return this.deleteService.deleteSlot(slotID);
  }

  @Get('report-meta')
  reportMeta(): Promise<any> {
    return this.getService.reportMeta();
  }

  @Get('report')
  report(@Query('type') type: string, @Query('date') date: Date): Promise<any> {
    return this.getService.report(date, type);
  }

  @Get('pending-faculty')
  pendingFaculty(@Query('designation') desig: number): Promise<Faculty[]> {
    return this.getService.pendingFaculty(desig);
  }

  @Post('faculties')
  @UseInterceptors(FileInterceptor('file'))
  addFaculties(@UploadedFile() file: Express.Multer.File): Promise<Faculty[]> {
    return this.postService.addFaculties(file);
  }

  @Post('add-slots')
  @UseInterceptors(FileInterceptor('file'))
  addSlots(@UploadedFile() file: Express.Multer.File): Promise<Slot[]> {
    return this.postService.addSlots(file);
  }

  // for tests
  @Delete('all-test')
  deleteAll(): Promise<string> {
    return this.utilService.clearAll();
  }

  @Get('slots')
  getSlots(): Promise<Slot[]> {
    return this.utilService.getSlots();
  }
}

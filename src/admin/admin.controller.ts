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
  Res,
  HttpStatus,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { AdminAuthGuard } from '../auth/auth.guard';
import { SlotDTO, FacultyDTO } from '../shared/index.dto';
import { Slot, Faculty } from '../entities';
import {
  GetAdminService,
  PostAdminService,
  DeleteAdminService,
  UtilAdminService,
} from './services';
import { pendingFaculty } from './admin.dto';
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

  @Get('report')
  report(@Query('type') type: string, @Query('date') date: Date): Promise<any> {
    return this.getService.report(date, type);
  }

  @Get('report-meta')
  reportMeta(): Promise<any> {
    return this.getService.reportMeta();
  }

  @Get('pending-faculty')
  pendingFaculty(
    @Query('designation') desig: number,
  ): Promise<pendingFaculty[]> {
    return this.getService.pendingFaculty(desig);
  }

  @Get('slots')
  getSlots(): Promise<Slot[]> {
    return this.utilService.getSlots();
  }

  @Get('auto-allocate')
  autoAllocate(): Promise<void> {
    return this.getService.autoAllocate();
  }

  @Post('slots')
  @UseInterceptors(FileInterceptor('file'))
  addSlots(@UploadedFile() file: Express.Multer.File): Promise<Slot[]> {
    return this.postService.addSlots(file);
  }

  @Post('slot')
  addSlot(@Body('slot') slot: SlotDTO): Promise<Slot> {
    return this.postService.addSlot(slot);
  }

  @Post('faculty')
  addFaculty(@Body('faculty') faculty: FacultyDTO): Promise<Faculty> {
    return this.postService.addFaculty(faculty);
  }

  @Post('faculties')
  @UseInterceptors(FileInterceptor('file'))
  addFaculties(@UploadedFile() file: Express.Multer.File): Promise<Faculty[]> {
    return this.postService.addFaculties(file);
  }

  @Post('send-mails')
  sendMails(@Body('facultyIDs') facultyIDs: string[]): Promise<Faculty[]> {
    return this.postService.sendMails(facultyIDs);
  }

  @Delete('slots')
  @HttpCode(204)
  async deleteSlots(@Body('slotIDs') slotIDs: string[], @Res() res: Response) {
    const resp = await this.deleteService.deleteSlots(slotIDs);
    if (resp.length === 0) res.status(HttpStatus.NO_CONTENT).send();
    else res.status(HttpStatus.BAD_REQUEST).json(resp);
  }

  @Delete('faculties')
  @HttpCode(204)
  async deleteFaculties(
    @Body('facultyIDs') facultyIDs: string[],
    @Res() res: Response,
  ) {
    const resp = await this.deleteService.deleteFaculties(facultyIDs);
    if (resp.length === 0) res.status(HttpStatus.NO_CONTENT).send();
    else res.status(HttpStatus.BAD_REQUEST).json(resp);
  }

  @Delete('faculty')
  @HttpCode(204)
  deleteFaculty(@Body('facultyID') facID: string): Promise<void> {
    return this.deleteService.deleteFaculty(facID);
  }

  @Delete('slot')
  @HttpCode(204)
  deleteSlot(@Body('slotID') slotID: string): Promise<void> {
    return this.deleteService.deleteSlot(slotID);
  }

  // for tests
  @Delete('all-test')
  deleteAll(): Promise<string> {
    return this.utilService.clearAll();
  }
}

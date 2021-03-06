import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';

import { FacultyAuthGuard } from '../auth/auth.guard';
import { FacultyService } from './faculty.service';
import { JWTdecoded } from '../shared/index.dto';
import {
  slotsResp,
  SlotSelectionError,
  SlotSelectionResp,
} from './faculty.dto';

@Controller('api/faculty')
@UseGuards(FacultyAuthGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get('slots')
  async getSlots(
    @Query('type') type: string,
    @Body('user') user: JWTdecoded,
  ): Promise<slotsResp[]> {
    return this.facultyService.getAllSlots(user.username);
  }

  // @Get('all-slots')
  // async getAllSlots(@Body('user') user: JWTdecoded): Promise<slotsResp[]> {
  //   return this.facultyService.getAllSlots(user.username);
  // }

  @Post('select-slots')
  async selectSlot(
    @Body('user') user: JWTdecoded,
    @Body('slotIDs') slotIDs: string[],
  ): Promise<SlotSelectionResp> {
    return this.facultyService.selectSlots(user, slotIDs);
  }
}

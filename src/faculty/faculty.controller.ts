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
import { Slot } from '../entities/Slot.entity';
import { slotsResp } from './faculty.dto';

@Controller('api/faculty')
@UseGuards(FacultyAuthGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get('slots')
  async getSlots(
    @Query('type') type: string,
    @Body('user') user: JWTdecoded,
  ): Promise<slotsResp[]> {
    if (!type.match(/^(morn|aft)$/))
      throw new BadRequestException('Invalid type field!!');
    return this.facultyService.getSlots(type, user.username);
  }

  @Post('select-slot')
  async selectSlot(
    @Body('user') user: JWTdecoded,
    @Body('slotID') slotID: string,
  ): Promise<Slot[]> {
    return this.facultyService.selectSlot(user, slotID);
  }
}

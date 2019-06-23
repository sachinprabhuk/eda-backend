import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { FacultyAuthGuard } from '../auth/auth.guard';
import { FacultyService } from './faculty.service';
import { JWTdecoded } from '../shared/index.dto';
import { Slot } from '../entities/Slot.entity';

@Controller('api/faculty')
@UseGuards(FacultyAuthGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post('select-slot')
  async selectSlot(
    @Body('user') user: JWTdecoded,
    @Body('slotID') slotID: string,
  ): Promise<Slot[]> {
    return this.facultyService.selectSlot(user, slotID);
  }
}

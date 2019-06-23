import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { FacultyAuthGuard } from '../auth/auth.guard';
import { FacultyService } from './faculty.service';
import { JWTdecoded } from '../shared/index.dto';

@Controller('api/faculty')
@UseGuards(FacultyAuthGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post('select-slot')
  async selectSlot(
    @Body('user') user: JWTdecoded,
    @Body('slotID') slotID: string,
  ): Promise<any> {
    return this.facultyService.selectSlot(user, slotID);
  }
}

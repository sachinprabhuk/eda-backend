import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Faculty } from '../entities/Faculty.entity';
import { Slot } from '../entities/Slot.entity';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { AuthModule } from '../auth/auth.module';
import { SlotLim } from '../entities/SlotLim.entity';

@Module({
  imports: [
		TypeOrmModule.forFeature([Faculty, Slot, SlotLim]),
		AuthModule
  ],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}

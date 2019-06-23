import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Faculty } from '../entities/Faculty.entity';
import { Slot } from '../entities/Slot.entity';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
		TypeOrmModule.forFeature([Faculty, Slot]),
		AuthModule
  ],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}

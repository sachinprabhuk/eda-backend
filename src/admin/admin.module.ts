import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Admin } from '../entities/Admin.entity';
import { Faculty } from '../entities/Faculty.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { Slot } from '../entities/Slot.entity';
import { SlotLim } from '../entities/SlotLim.entity';

@Module({
  imports: [
		TypeOrmModule.forFeature([Admin, Faculty, Slot, SlotLim]),
		AuthModule
	],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

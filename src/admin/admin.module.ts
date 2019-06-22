import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Admin } from '../entities/Admin.entity';
import { Faculty } from '../entities/Faculty.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
		TypeOrmModule.forFeature([Admin, Faculty]),
		AuthModule
	],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

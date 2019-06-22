import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Admin } from '../entities/Admin.entity';
import { Faculty } from '../entities/Faculty.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminAuthGuard, FacultyAuthGuard } from './auth.guard';

@Module({
  imports: [
		TypeOrmModule.forFeature([Admin, Faculty])
	],
  controllers: [AuthController],
	providers: [AuthService, AdminAuthGuard, FacultyAuthGuard],
	exports: [AdminAuthGuard, FacultyAuthGuard]
})
export class AuthModule {}

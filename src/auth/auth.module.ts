import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Admin } from '../entities/Admin.entity';
import { Faculty } from '../entities/Faculty.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
		TypeOrmModule.forFeature([Admin, Faculty])
	],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Admin } from '../entities/Admin.entity';
import { Faculty } from '../entities/Faculty.entity';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { Slot } from '../entities/Slot.entity';
import { SlotLim } from '../entities/SlotLim.entity';
import { DeleteAdminService } from './services/delete.admin.service';
import { GetAdminService } from './services/get.admin.service';
import { PostAdminService } from './services/post.admin.service';
import { UtilAdminService } from './services/util.admin.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Faculty, Slot, SlotLim]),
    AuthModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AdminController],
  providers: [
    DeleteAdminService,
    GetAdminService,
    PostAdminService,
    UtilAdminService,
  ],
})
export class AdminModule {}

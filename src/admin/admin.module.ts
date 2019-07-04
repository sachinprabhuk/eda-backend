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
import { MailerModule, HandlebarsAdapter } from '@nest-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Faculty, Slot, SlotLim]),
    AuthModule,
    MulterModule.register({
      dest: '/tmp',
    }),
    MailerModule.forRoot({
      transport: `smtps://${process.env.MAIL_ADDR}:${process.env.MAIL_PWD}@${process.env.MAIL_SERVER_ADDR}`,
      defaults: {
        from: `'sachin prabhu' <${process.env.MAIL_ADDR}>`,
      },
      template: {
        dir: __dirname + '/emailTemplates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
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

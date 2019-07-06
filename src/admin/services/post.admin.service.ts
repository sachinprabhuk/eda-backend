import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { readFile, utils, WorkBook, SSF } from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nest-modules/mailer';

import { SlotDTO, FacultyDTO } from '../../shared/index.dto';
import { Slot, Faculty, SlotLim } from '../../entities';

@Injectable()
export class PostAdminService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
    @InjectRepository(SlotLim)
    private readonly limRepo: Repository<SlotLim>,
    private readonly mailService: MailerService,
  ) {}

  async addSlot({ date, type, total }: SlotDTO): Promise<Slot> {
    date = new Date(date);

    const slot = new Slot();
    slot.total = total;
    slot.date = date;
    slot.remaining = total;
    slot.type = type;
    try {
      if (await this.slotRepo.findOne({ date, type }))
        throw new BadRequestException('Duplicate entry!!');
      await this.slotRepo.insert(slot);
      return slot;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException(
        'Error while adding new slot!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addFaculty({
    id,
    name,
    branch,
    contact,
    designation,
    email,
  }: FacultyDTO): Promise<Faculty> {
    const slotLim = await this.limRepo.findOne({ designation });
    if (!slotLim) throw new BadRequestException('Invalid designation!!');

    if (await this.facultyRepo.findOne({ id }))
      throw new BadRequestException('Duplicate faculty id!');

    const faculty = new Faculty();
    faculty.id = id;
    faculty.name = name;
    faculty.password = contact;
    faculty.branch = branch;
    faculty.contact = contact;
    faculty.slotLim = slotLim;
    faculty.email = email;
    try {
      await this.facultyRepo.insert(faculty);
      delete faculty.slotLim;
      delete faculty.password;
      return faculty;
    } catch (e) {
      throw new HttpException(
        'Error while adding new faculty!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addFaculties(file: Express.Multer.File): Promise<Faculty[]> {
    const workBook: WorkBook = readFile(`/tmp/${file.filename}`);
    const firstSheetName = workBook.SheetNames[0];
    const sheet = workBook.Sheets[firstSheetName];
    const facultyArray: FacultyDTO[] = utils.sheet_to_json(sheet);

    facultyArray.reduce((acc, curr) => {
      if(acc.has(curr.id))
        throw new BadRequestException("Invalid file!!duplicate id's found");
      acc.add(curr.id);
      return acc;
    }, new Set())

    return await Promise.all(
      facultyArray.map(faculty => this.addFaculty(faculty)),
    );
  }

  async addSlots(file: Express.Multer.File): Promise<Slot[]> {
    const workBook: WorkBook = readFile(`/tmp/${file.filename}`);
    const firstSheetName = workBook.SheetNames[0];
    const sheet = workBook.Sheets[firstSheetName];
    const slotArray: SlotDTO[] = utils.sheet_to_json(sheet);

    const parsedSlotArray = slotArray.map((slot: any) => {
      const dateObj = SSF.parse_date_code(slot.date);
      slot.date = new Date(dateObj.y, dateObj.m, dateObj.d);
      return slot;
    });

    return await Promise.all(parsedSlotArray.map(slot => this.addSlot(slot)));
  }

  async sendMails(facultyIDs: string[]): Promise<Faculty[]> {
    const resp: Faculty[] = [];
    await Promise.all(
      facultyIDs.map(async id => {
        const faculty = await this.facultyRepo.findOne({
          relations: ['selections'],
          where: { id },
        });

        const emailAddr =
          process.env.NODE_ENV === 'development'
            ? process.env.MAIL_ADDR
            : faculty.email;

        try {
          await this.mailService.sendMail({
            to: emailAddr,
            subject: `email regarding your slot selection for exam duty for the academic year 2019-20`,
            // html: `<b>welcome ${emailAddr}</b>`,
            template: 'selectionList',
            context: {
              name: faculty.name,
              selections: faculty.selections,
            },
          });
        } catch (e) {
          console.log(e);
          resp.push(faculty);
        }
        Promise.resolve();
      }),
    );
    return resp;
  }
}

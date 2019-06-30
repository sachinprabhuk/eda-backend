import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SlotDTO, FacultyDTO } from '../../shared/index.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    password,
    branch,
    contact,
    designation,
    email,
  }: FacultyDTO): Promise<Faculty> {
    const slotLim = await this.limRepo.findOne({ designation });
    if (!slotLim) throw new BadRequestException('Invalid designation!!');

    const faculty = new Faculty();
    faculty.id = id;
    faculty.name = name;
    faculty.password = password;
    faculty.branch = branch;
    faculty.contact = contact;
    faculty.slotLim = slotLim;
    faculty.email = email;
    try {
      await this.facultyRepo.insert(faculty);
      delete faculty.slotLim;
      return faculty;
    } catch (e) {
      throw new HttpException(
        'Error while adding new faculty!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

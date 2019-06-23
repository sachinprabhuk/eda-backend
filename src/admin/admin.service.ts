import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

import { Faculty } from '../entities/Faculty.entity';
import { Admin } from '../entities/Admin.entity';
import { Slot } from '../entities/Slot.entity';
import { SlotDTO, FacultyDTO } from '../shared/index.dto';

export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
  ) {}

  async getSelections(): Promise<any> {
    const res: any[] = await this.slotRepo
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.faculties', 'faculties')
      .select([
        'slot.id',
        'slot.date',
        'slot.total',
        'slot.remaining',
        'slot.type',
        'JSON_ARRAYAGG(faculties.id) as faculties',
      ])
      .groupBy('slot.id')
      .addGroupBy('slot.date')
      .addGroupBy('slot.total')
      .addGroupBy('slot.remaining')
      .addGroupBy('slot.type')
      .getRawMany();

    return res.map(el => {
      el.faculties = JSON.parse(el.faculties);
      return el;
    });

    // Note: Below is an awesome and simple way, but it has excess info
    // about faculty. Find a way to select only id.
    // const res: any[] = await this.slotRepo.find({
    //   relations: ['faculties'],
    // })
  }

  async addSlot({ date, type, total }: SlotDTO): Promise<Slot> {
    const slot = new Slot();
    slot.total = total;
    slot.date = date;
    slot.remaining = total;
    slot.type = type;
    try {
      await this.slotRepo.save(slot);
      return slot;
    } catch (e) {
      throw new HttpException(
        e,
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
    const faculty = new Faculty();
    faculty.id = id;
    faculty.name = name;
    faculty.password = password;
    faculty.branch = branch;
    faculty.contact = contact;
    faculty.designation = designation;
    faculty.email = email;
    try {
      await this.facultyRepo.insert(faculty);
      return faculty;
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async getSlots(): Promise<Slot[]> {
    return await this.slotRepo.find();
  }
}

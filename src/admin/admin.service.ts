import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

import { Faculty } from '../entities/Faculty.entity';
import { Admin } from '../entities/Admin.entity';
import { Slot } from '../entities/Slot.entity';
import { SlotDTO, FacultyDTO } from '../shared/index.dto';
import { SlotLim } from '../entities/SlotLim.entity';

export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
    @InjectRepository(SlotLim)
    private readonly limRepo: Repository<SlotLim>,
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
        'Error while adding new faculty!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFaculty(facID: string): Promise<Faculty> {
    try {
      const faculty = await this.facultyRepo.findOne({
        where: { id: facID },
        relations: ['selections'],
      });
      if (!faculty) throw new BadRequestException('Invalid faculty id');

      await getManager().transaction(async entityManager => {
        await entityManager.remove(faculty);
        await Promise.all(
          faculty.selections.map((slot: Slot) => {
            slot.remaining += 1;
            return entityManager.save(slot);
          }),
        );
      });

      return faculty;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException(
        'Error while deleting faculty',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSlot(slotID: string): Promise<Slot> {
    const slot: Slot = await this.slotRepo.findOne({ id: slotID });
    if (!slot) throw new BadRequestException('Invalid slot id');
    try {
      await this.slotRepo.delete(slot);
      return slot;
    } catch (e) {
      throw new HttpException(
        'Error while deleting the slot',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async pendingFaculty(): Promise<Faculty[]> {
    this.facultyRepo.find({
      relations: ['selections'],
      where: {},
    });
    return;
  }

  async reportMeta(): Promise<any> {
    try {
      const result: any = await this.slotRepo
        .createQueryBuilder()
        .select(['type', 'JSON_ARRAYAGG(date) as dates'])
        .groupBy('type')
        .getRawMany();

      return result.reduce((acc, curr) => {

        acc[curr['type']] = JSON.parse(curr['dates']);
        return acc;
      }, {});
    } catch (e) {
      throw new HttpException(
        'Error while fetching report!!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async report(date: Date, slotType: string): Promise<any> {
    try {
      if (!slotType || !slotType.match(/^(aft|morn)$/))
        throw new BadRequestException('Invalid type');
      return await this.slotRepo
        .createQueryBuilder('slot')
        .innerJoinAndSelect('slot.faculties', 'faculties')
        .select([
          'faculties.id as id',
          'faculties.name as name',
          'faculties.branch as branch',
          'faculties.designation as designation',
        ])
        .where("slot.date = :date", { date: new Date(date) })
        .andWhere("slot.type = :type", { type: slotType })
        .getRawMany();
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //////////////////// end points for testing //////////////////////////
  async getSlots(): Promise<Slot[]> {
    return await this.slotRepo.find();
  }

  async clearAll(): Promise<string> {
    await this.slotRepo.delete({});
    await this.facultyRepo.delete({});
    return 'done';
  }
}

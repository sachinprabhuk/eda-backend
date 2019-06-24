import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

import { Faculty } from '../entities/Faculty.entity';
import { Admin } from '../entities/Admin.entity';
import { Slot } from '../entities/Slot.entity';
import { SlotDTO, FacultyDTO } from '../shared/index.dto';
import { CustomError, CUSTOM_ERROR_NAME } from '../shared/Custom.Error';
// import { BadRequestException } from '../shared/BadRequest.Exception';
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
      if (!faculty) throw new CustomError('Invalid faculty id');

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
      if (e.name === CUSTOM_ERROR_NAME)
        throw new HttpException(e.message, e.status);
      else
        throw new HttpException(
          'Error while deleting faculty',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  // async deleteSlot(slotID: string): Promise<Slot> {
  //   const slot: Slot = await this.slotRepo.findOne({ id: slotID });
  //   if (!slot) throw new BadRequestException('Invalid slot id');

  //   await this.slotRepo.delete(slot);
  //   return slot;
  // }

  async getSlots(): Promise<Slot[]> {
    return await this.slotRepo.find();
  }

  async clearAll(): Promise<string> {
    await this.slotRepo.delete({});
    await this.facultyRepo.delete({});
    return 'done';
  }
}

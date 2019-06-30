import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

import { Faculty } from '../entities/Faculty.entity';
import { Admin } from '../entities/Admin.entity';
import { Slot } from '../entities/Slot.entity';
import { SlotDTO, FacultyDTO } from '../shared/index.dto';
import { SlotLim } from '../entities/SlotLim.entity';
import { SQLdate } from '../shared/tools';

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

      /* SQL way
      -------------
      let query = `
        select F.id, F.name, F.designation, F.branch
        from faculty F, selection SEL, slot S
        where F.id = SEL.facultyId and
        SEL.slotId = S.id and 
        S.date = '${SQLdate(date)}' and
        S.type = '${slotType}'
      `;
      const entityManager = getManager();
      return await entityManager.query(query);
      */

      const currSlot = await this.slotRepo.findOne({
        where: {
          date: new Date(date),
          type: slotType,
        },
        relations: ['faculties'],
      });
      if (!currSlot) throw new Error();
      return currSlot.faculties;
    } catch (e) {
      throw new HttpException(
        'Ooop! something went wrong!!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async pendingFaculty(designation: number): Promise<any> {
    const query = `
      select F.id, F.name, F.branch, F.email
      from faculty F, selection S
      where F.id = S.facultyId and
      F.designation=${designation}
      group by F.id, F.name, F.branch, F.designation
      having count(*) < (
        select maximum
        from slot_lim
        where designation = F.designation
      )
    `;
    const entityManager = getManager();
    return await entityManager.query(query);
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

import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';

import { Slot } from '../../entities';

@Injectable()
export class GetAdminService {
  constructor(
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
}

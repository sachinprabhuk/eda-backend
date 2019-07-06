import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, Not, In, MoreThan, Raw } from 'typeorm';

import { Slot, Faculty } from '../../entities';
import { pendingFaculty } from '../admin.dto';

@Injectable()
export class GetAdminService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
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

  async pendingFaculty(designation: number): Promise<pendingFaculty[]> {
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

  async autoAllocate(): Promise<void> {
    //   const query = `
    //   select F.id, F.name, F.branch, F.email
    //   from faculty F, selection S
    //   where F.id = S.facultyId
    //   group by F.id, F.name, F.branch, F.designation
    //   having count(*) < (
    //     select maximum
    //     from slot_lim
    //     where designation = F.designation
    //   )
    // `;
    const allFaculty = await this.facultyRepo.find({
      relations: ['selections', 'slotLim'],
    });
    const pendingFacs: Faculty[] = allFaculty.filter(
      fac => fac.selections.length < fac.slotLim.maximum,
    );

    // for allocating slots to faculties in sequential oreder.
    await pendingFacs.reduce(
      async (prevPromise: Promise<Faculty | void>, currFaculty: Faculty) => {
        await prevPromise;

        const selectedSlotIDs = currFaculty.selections.map(
          slot => `${slot.id}`,
        );
        selectedSlotIDs.push('');

        const toAllocate: Slot[] = await this.slotRepo.find({
          where: {
            id: Not(In(selectedSlotIDs)),
            remaining: MoreThan(0),
          },
          take: currFaculty.slotLim.maximum - currFaculty.selections.length,
        });

        toAllocate.forEach(slot => {
          slot.remaining -= 1;
          currFaculty.selections.push(slot);
        });

        return await this.facultyRepo.save(currFaculty);
      },
      Promise.resolve(),
    );
  }

  async getFaculties(): Promise<Faculty[]> {
    return await this.facultyRepo.find({
      relations: ["slotLim", "selections"],
      select: ["name", "id", "branch", "slotLim", "selections", "contact"],
    })
  }

}

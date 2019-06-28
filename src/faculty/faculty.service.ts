import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { JWTdecoded } from '../shared/index.dto';
import { Slot } from '../entities/Slot.entity';
import { Faculty } from '../entities/Faculty.entity';
import { SlotLim } from '../entities/SlotLim.entity';
import {
  slotsResp,
  SlotSelectionError,
  SlotSelectionResp,
} from './faculty.dto';

const areDatesEqual = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(SlotLim)
    private readonly slotLimRepo: Repository<SlotLim>,
  ) {}

  async getSlots(type: string, userID: string): Promise<slotsResp[]> {
    const db = await this.slotRepo.createQueryBuilder('slot');

    const subQuery = db
      .subQuery()
      .from(Faculty, 'faculty')
      .leftJoinAndSelect('faculty.selections', 'selections')
      .select('selections.date')
      .andWhere('faculty.id = :id')
      .getQuery();

    return await db
      .select([
        'slot.id as id',
        'slot.date as date',
        'slot.total as total',
        'slot.remaining as remaining',
      ])
      .where('slot.date NOT IN ' + subQuery)
      .andWhere('slot.type = :type')
      .setParameter('type', type)
      .setParameter('id', userID)
      .getRawMany();
  }

  async selectSlot(
    faculty: Faculty,
    slotID: string,
  ): Promise<Slot | SlotSelectionError> {
    // slot validation.
    const slot = await this.slotRepo.findOne({ id: slotID });
    if (!slot) return new SlotSelectionError('Invalid slot id', slotID);
    if (slot.remaining <= 0)
      return new SlotSelectionError(
        'Sorry! no slots remaining on this date',
        slot.date,
      );

    // checking if faculty has previously selected slot on the same date.
    // --------------------------------------------------------------------
    // if (
    //   faculty.selections.find(
    //     facSlot =>
    //       facSlot.id === slotID ||
    //       areDatesEqual(new Date(facSlot.date), new Date(slot.date)),
    //   )
    // )
    //   return new SlotSelectionError(
    //     'You have already selected a slot on this date',
    //     slot.date,
    //   );

    // check if the faculty has already selected max slot, based on designation
    // --------------------------------------------------------------------
    // const { mornMax, aftMax } = faculty.slotLim;
    // const [ mornSel, aftSel ] = faculty.selections.reduce(
    //   (acc, curr: Slot) => {
    //     if (curr.type === 'morn') ++acc[0];
    //     else ++acc[1];
    //     return acc;
    //   },
    //   [0, 0],
    // );
    // if(slot.type === 'morn' && (mornSel >= mornMax))
    //   return new SlotSelectionError("morning slot selection limit reached", mornMax)
    // if(slot.type === 'aft' && (aftSel >= aftMax))
    //   return new SlotSelectionError("afternoon slot selection limit reached", aftMax)

    // registration.
    faculty.selections.push(slot);
    slot.remaining -= 1;
    await this.facultyRepo.save(faculty);

    // returning the faculties selection.
    return slot;
  }

  async selectSlots(
    { username }: JWTdecoded,
    slotIDs: Array<string>,
  ): Promise<SlotSelectionResp> {
    try {
      const resp: SlotSelectionResp = new SlotSelectionResp();

      // faculty validation.
      const faculty = await this.facultyRepo.findOne({
        where: { id: username },
        relations: ['selections', 'slotLim'],
      });
      if (!faculty) {
        resp.updateResp(new SlotSelectionError('Invalid faculty id', username));
        return resp;
      }

      // sequential exectution of slot selection.
      const data = await slotIDs.reduce(
        async (prevPromise: Promise<any>, currentSlotID: string) => {
          const resData = await prevPromise;
          resp.updateResp(resData);
          return this.selectSlot(faculty, currentSlotID);
        },
        Promise.resolve(),
      );
      resp.updateResp(data);

      return resp;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException("Ooops!!Something went wrong!!!");
    }
  }
}

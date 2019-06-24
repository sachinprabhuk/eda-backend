import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { JWTdecoded } from '../shared/index.dto';
import { Slot } from '../entities/Slot.entity';
import { Faculty } from '../entities/Faculty.entity';
import { SlotLim } from '../entities/SlotLim.entity';

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

  async selectSlot(userInfo: JWTdecoded, slotID: string): Promise<Slot[]> {
    try {
      // slot validation.
      const slot = await this.slotRepo.findOne({ id: slotID });
      if (!slot) throw new BadRequestException('Invalid slot id');
      if (slot.remaining <= 0)
        throw new BadRequestException('No more slot left!sorry');

      // faculty validation.
      const faculty = await this.facultyRepo.findOne({
        where: {
          id: userInfo.username,
        },
        relations: ['selections'],
      });
      if (!faculty) throw new BadRequestException('Invalid faculty id');

      // checking if faculty has previously selected slot on the same date.
      if (
        faculty.selections.find(
          facSlot =>
            facSlot.id === slotID || areDatesEqual(facSlot.date, slot.date),
        )
      )
        throw new BadRequestException(
          'You have already selected a slot on this date',
        );

      // check if the faculty has already selected max slot, based on designation

      // registration.
      faculty.selections.push(slot);
      slot.remaining -= 1;
      await this.facultyRepo.save(faculty);

      // returning the faculty.
      return faculty.selections;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException(
        'Error while saving slot!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

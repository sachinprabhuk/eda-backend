import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { JWTdecoded } from '../shared/index.dto';
import { Slot } from '../entities/Slot.entity';
import { Faculty } from '../entities/Faculty.entity';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
  ) {}

  async selectSlot(userInfo: JWTdecoded, slotID: string): Promise<any> {
    try {
      const slot = await this.slotRepo.findOne({ id: slotID });
      if (!slot) throw new Error('Invalid slot id');
      if (slot.remaining <= 0) throw new Error('No more slot left!sorry');

      const faculty = await this.facultyRepo.findOne({
        where: {
          id: userInfo.username,
        },
        relations: ['selections'],
      });
      if (!faculty) throw new Error('Invalid faculty id');

      if (faculty.selections.find(slot => slot.id === slotID))
        throw new Error('You have already selected this slot!');

      faculty.selections.push(slot);
      slot.remaining -= 1;
      await this.facultyRepo.save(faculty);
      return faculty;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

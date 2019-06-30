import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';

import { Slot } from '../../entities/Slot.entity';
import { Faculty } from '../../entities';

@Injectable()
export class DeleteAdminService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
  ) {}

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
}

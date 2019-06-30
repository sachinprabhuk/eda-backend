import { Injectable } from '@nestjs/common';
import { Slot, Faculty } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UtilAdminService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
  ) {}

  async getSlots(): Promise<Slot[]> {
    return await this.slotRepo.find();
  }

  async clearAll(): Promise<string> {
    await this.slotRepo.delete({});
    await this.facultyRepo.delete({});
    return 'done';
  }
}

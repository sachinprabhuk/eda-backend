import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Faculty } from '../entities/Faculty.entity';
import { Admin } from '../entities/Admin.entity';
import { Slot } from '../entities/Slot.entity';

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
      .createQueryBuilder("slot")
      .leftJoinAndSelect("slot.faculties", "faculties")
      .select([
        "slot.id", "slot.date", 
        "slot.total", "slot.remaining",
        "JSON_ARRAYAGG(faculties.id) as faculties"
      ])
      .groupBy("slot.id")
      .addGroupBy("slot.date")
      .addGroupBy("slot.total")
      .addGroupBy("slot.remaining")     
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
}

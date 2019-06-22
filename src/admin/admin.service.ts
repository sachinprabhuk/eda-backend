import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Faculty } from '../entities/Faculty.entity';
import { Admin } from '../entities/Admin.entity';

export class AdminService {
	constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
	) {}
	
	
}
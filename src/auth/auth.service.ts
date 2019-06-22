import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LoginDTO, JWTdecoded } from './auth.dto';
import { Admin } from '../entities/Admin.entity';
import { Faculty } from '../entities/Faculty.entity';

export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
  ) {}

  async adminLogin({ username, password, admin }: LoginDTO): Promise<string> {
    const user = await this.adminRepo.findOne({
      username,
      password,
    });
    if (!user)
			throw new HttpException('invalid username or password!', HttpStatus.UNAUTHORIZED);
    else {
      const token = jwt.sign(
        {
          username,
          admin,
        },
        process.env.SECRETE_KEY,
        { expiresIn: '1h' },
      );
      return token
    }
  }

  async facultyLogin({ username, password, admin }: LoginDTO): Promise<string> {
		const user = await this.facultyRepo.findOne({
      id: username,
      password
    });
		if (!user) 
			throw new HttpException('invalid username or password!', HttpStatus.UNAUTHORIZED);
    else {
      const token = jwt.sign(
        {
          username,
          admin,
        },
        process.env.SECRETE_KEY,
        { expiresIn: '1h' },
      );
      return token;
    }
	}

  login(loginDTO: LoginDTO): Promise<string> {
    return loginDTO.admin
      ? this.adminLogin(loginDTO)
      : this.facultyLogin(loginDTO);
	}
	
	isAuth(token: string): JWTdecoded {
		try {
			const decoded: JWTdecoded = jwt.verify(token, process.env.SECRETE_KEY) as JWTdecoded;
			if(decoded.hasOwnProperty('username') && decoded.hasOwnProperty("admin"))
				return decoded;
			throw new Error();
		}catch(e) {
			throw new HttpException('invalid token!', HttpStatus.UNAUTHORIZED);
		}
	}

}

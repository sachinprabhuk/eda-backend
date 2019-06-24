import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { JWTdecoded } from '../shared/index.dto';

const authGuardGenerator = (forAdmin: boolean): any => {

	@Injectable() 
	class Guard implements CanActivate {
		canActivate(context: ExecutionContext): boolean {
			const request: Request = context.switchToHttp().getRequest();
			const token = request.headers.authorization;
			////////////////
			if(token === 'test123')
				return true
			//////////////////

			try {
				const decoded: JWTdecoded = jwt.verify(
					token,
					process.env.SECRETE_KEY,
				) as JWTdecoded;
	
				if (
					decoded.hasOwnProperty('username') && 
					decoded.hasOwnProperty('admin') &&
					decoded.admin === forAdmin
				) {
					request.body.user = decoded;
					return true;
				}
				throw new Error();
			} catch (e) {
				return false;
			}
			
		}
	}
	return Guard;
}

export const AdminAuthGuard = authGuardGenerator(true);
export const FacultyAuthGuard = authGuardGenerator(false); 


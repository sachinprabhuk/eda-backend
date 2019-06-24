import { HttpException, HttpStatus } from "@nestjs/common";


// BRE === Bad request exception
// Build in is available, but its message property 
// is not in desirable structure.

export class BadRequestException extends HttpException {
	constructor(msg: string) {
		super(msg, HttpStatus.BAD_REQUEST);
	}
}
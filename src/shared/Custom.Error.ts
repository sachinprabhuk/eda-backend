import { HttpStatus } from "@nestjs/common";

export const CUSTOM_ERROR_NAME = 'CustomError';

export class CustomError extends Error {
	readonly status: HttpStatus;
	constructor(message: string, httpStatus?: HttpStatus) {
		super(message);
		this.status = httpStatus || HttpStatus.BAD_REQUEST;
		this.name = CUSTOM_ERROR_NAME;
	}
}
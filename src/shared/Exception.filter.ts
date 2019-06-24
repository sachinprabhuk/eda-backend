import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response: Response = ctx.getResponse()

    const [statusCode, message] =
      exception instanceof HttpException
        ? [exception.getStatus(), exception.message]
        : [HttpStatus.INTERNAL_SERVER_ERROR, "Ooops! something went wrong"];
    
    response.status(statusCode).json({
      statusCode, message
    });
  }
}

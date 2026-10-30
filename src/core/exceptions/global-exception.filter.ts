import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ResponseDto } from '../dtos/response.dto.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} failed`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(
      new ResponseDto(
        false,
        this.getTitle(status),
        this.getMessage(exception),
        null,
      ),
    );
  }

  private getMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) {
      return 'Ocurrió un error interno en el servidor.';
    }

    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    const message = (
      exceptionResponse as { message?: string | string[] }
    ).message;

    return Array.isArray(message)
      ? message.join(', ')
      : (message ?? exception.message);
  }

  private getTitle(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Solicitud inválida';
      case HttpStatus.UNAUTHORIZED:
        return 'No autorizado';
      case HttpStatus.FORBIDDEN:
        return 'Acceso denegado';
      case HttpStatus.NOT_FOUND:
        return 'Recurso no encontrado';
      case HttpStatus.CONFLICT:
        return 'Conflicto de datos';
      default:
        return status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Error interno del servidor'
          : 'Error en la solicitud';
    }
  }
}

import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";
import { AppError, toErrorBody } from "../errors/app-error";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      res.status(exception.status).json(toErrorBody(exception));
      return;
    }

    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json({
        error: { code: "VALIDATION_ERROR", message: exception.message },
      });
      return;
    }

    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
    });
  }
}

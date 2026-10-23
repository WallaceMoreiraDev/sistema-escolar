import { StatusCode } from 'hono/utils/http-status';

export type ErrorCode = 
  | "AUTH_UNAUTHORIZED"
  | "AUTH_FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "BAD_REQUEST"
  | "CLASS_REQUEST_DUPLICATE"
  | "ALREADY_IN_CLASS"
  | "INVITE_CODE_ALREADY_EXISTS"
  | "APPROVAL_FAILED"
  | "LAST_LEADER_CONFLICT"
  | "CANNOT_MODIFY_SELF"
  | "USER_WITHOUT_CLASS"
  | "TURMA_REQUIRED"
  | "LAST_LEADER_CANNOT_LEAVE"
  | "USER_ALREADY_WITHOUT_CLASS";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: StatusCode;

  constructor(code: ErrorCode, statusCode: StatusCode = 400, message?: string) {
    super(message || code);
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

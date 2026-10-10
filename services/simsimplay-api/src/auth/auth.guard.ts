import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AppError } from "../common/errors/app-error";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers["authorization"] as string | undefined;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("UNAUTHORIZED", "Missing authentication token", 401);
    }
    const payload = this.auth.verifyToken(header.slice("Bearer ".length));
    req.userId = payload.sub;
    return true;
  }
}

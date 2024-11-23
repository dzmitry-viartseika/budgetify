import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>(ROLE_KEY, context.getHandler());
    this.logger.verbose('Required Role:', requiredRole);

    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    this.logger.verbose('User:', user);

    if (!user || !user.role) {
      this.logger.warn('User role is not properly defined:', user?.role);
      return false;
    }

    const hasRole = requiredRole === user.role;
    if (!hasRole) {
      this.logger.warn(`User does not have the required role: ${requiredRole}`);
    }

    return hasRole;
  }
}

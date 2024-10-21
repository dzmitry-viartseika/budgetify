import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  private logger = new Logger(TokensService.name);
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    this.logger.verbose(`Incoming request: ${request.headers}`);

    return super.canActivate(context) as boolean;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      this.logger.error(`Authentication failed:', ${err}`);
      throw err || new UnauthorizedException();
    }
    this.logger.verbose(`User authenticated successfully:', ${user}`);
    return user;
  }
}

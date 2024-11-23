import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: any) {
    console.log('Payload received in validate method:', payload); // Логируем payload
    const user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    console.log('User object returned from validate:', user); // Логируем возвращаемый объект
    return user;
  }
}

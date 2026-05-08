import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  validate(req: any) {
    const refreshToken = req.cookies.refreshToken;
    return { refreshToken };
  }
}

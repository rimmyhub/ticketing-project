import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        if (!req.cookie.refreshToken) throw new UnauthorizedException();
        const cookie = req.cookies.refreshToken;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: process.env.REFRESH_SECRET_KEY,
    });
  }
  validate(payload) {
    // jwt 토큰 검증
    if (payload['tokenType'] !== 'refresh') throw new UnauthorizedException();
    // jwt 토큰의 tokenType이 'refresh'가 아닌 경우에는 검증에 실패
    return {
      id: payload.sub,
    };
  }
}

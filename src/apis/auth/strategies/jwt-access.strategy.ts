import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  //JWT 토큰 검증 이름 'access'
  constructor() {
    super({
      jwtFromRequest: (req) => {
        if (!req.cookies.accessToken) throw new UnauthorizedException();
        // UnauthorizedException 권한이 없는 요청에 대한 예외 처리

        const cookie = req.cookies.accessToken;

        const accessToken = cookie.replace('accessToken=', '');
        // 쿠키를 가져와서 엑세스토큰 값을 추출
        return accessToken;
      },
      secretOrKey: process.env.ACCESS_SECRET_KEY,
      // JWT토큰의 유효성 검사를 위해 사용할 비밀키 설정
    });
  }
  // jwt가 유효한 경우 호출 토큰 검사하고 사용자 식별
  validate(payload) {
    return {
      id: payload.sub, // 사용자 ID반환s
    };
  }
}

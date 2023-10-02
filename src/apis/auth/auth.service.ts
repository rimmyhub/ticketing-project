import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  IAuthServiceGetAccessToken,
  IAuthServiceGetRefreshToken,
  IAuthServiceLogin,
  IAuthServiceLoginReturn,
  IAuthServiceRefresh,
} from './interfaces/auth-service.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({
    loginDto,
  }: IAuthServiceLogin): Promise<IAuthServiceLoginReturn> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail({ email });

    if (!user)
      throw new UnauthorizedException('해당하는 이메일의 유저가 없습니다.');

    const isAuth = await bcrypt.compare(password, user.password);

    if (!isAuth) throw new UnauthorizedException();

    const accessToken = this.getAccessToken({ userId: user.id });
    const refreshToken = this.getRefreshToken({ userId: user.id });

    return { accessToken, refreshToken };
  }

  refresh({ userId }: IAuthServiceRefresh): string {
    return this.getAccessToken({ userId });
  }

  private getAccessToken({ userId }: IAuthServiceGetAccessToken): string {
    const payload = { sub: userId }; // payload 객체는 JWT 토큰에 포함될 클레임(claim)들을 담는 객체. 여기서 sub 클레임은 사용자를 식별하기 위한 정보로 사용자의 userId를 포함
    // private 클래스 내부에만 사용
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_SECRET_KEY, // 엑세스 토큰 설정 비밀키
      expiresIn: '1d', // 1일 후 만료
    });
  }
  private getRefreshToken({ userId }: IAuthServiceGetRefreshToken): string {
    const payload = { sub: userId, tokenType: 'refresh' };
    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET_KEY,
      expiresIn: '14d', // 14일 후 만료
    });
  }
}

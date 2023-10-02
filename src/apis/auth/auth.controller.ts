import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MessageResDto } from 'src/commons/message-res.dto';
import { Response } from 'express'; //일반적으로 Node.js와 Express.js를 사용하여 웹 애플리케이션을 개발할 때, Response 객체에 cookie 속성이 내장되어 있지 않습니다.대신에, cookie를 express 미들웨어를 사용하여 설정하고 응답 헤더에 쿠키 정보를 추가해야 합니다.
import { RefreshAuthGuard } from './guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인 하기
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResDto> {
    const { accessToken, refreshToken } = await this.authService.login({
      loginDto,
    });

    res.cookie('refreshToken', refreshToken);
    res.cookie('accessToken', accessToken);

    return { message: '로그인을 성공적으로 완료하였습니다.' };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @User() user: UserAfterAuth,
    @Res({ passthrough: true }) res: Response, // 현재 인증된 사용자
  ): Promise<MessageResDto> {
    const accessToken = this.authService.refresh({
      userId: user.id,
    });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { message: 'refresh' };
  }
}

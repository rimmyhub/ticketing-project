import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { User } from './entities/user.entity';
import { User as UserD } from 'src/commons/decorators/user.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 회원 가입
  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserDto> {
    const createUser = await this.usersService.createUser({ createUserDto });
    return createUser;
  }

  // 내 정보 조회
  @UseGuards(AccessAuthGuard)
  @Get()
  async findUser(@UserD() user: UserAfterAuth): Promise<User> {
    const findUser = await this.usersService.findUser({ userId: user.id });
    return findUser;
  }

  // 내 정보 수정
  @UseGuards(AccessAuthGuard)
  @Put()
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @UserD() user: UserAfterAuth,
  ): Promise<User> {
    const updateUser = await this.usersService.updateUser({
      userId: user.id,
      updateUserDto,
    });

    return updateUser;
  }

  // 회원 탈퇴
  @UseGuards(AccessAuthGuard)
  @Delete()
  async deleteUser(@UserD() user: UserAfterAuth): Promise<void> {
    const deleteUser = await this.usersService.deleteUser({
      userId: user.id,
    });
    return deleteUser;
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IUsersServiceCreateUser,
  IUsersServiceFindByEmail,
} from './interfaces/users-service.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // 유저 생성하기
  async createUser({ createUserDto }: IUsersServiceCreateUser): Promise<User> {
    const { email, password, nickName } = createUserDto;

    const user = await this.findByEmail({ email });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this.usersRepository.save({
      email,
      password: hashedPassword,
      nickName,
    });

    return result;
  }

  // 유저 이메일 찾기
  async findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }
}

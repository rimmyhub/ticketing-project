import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IUsersServiceCreateUser,
  IUsersServiceDeleteUser,
  IUsersServiceFindByEmail,
  IUsersServiceFindById,
  IUsersServiceFindUser,
  IUsersServiceUpdateUser,
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

  // 내 정보 조회
  async findUser({ userId }: IUsersServiceFindUser): Promise<User> {
    const user = await this.findById({ userId });
    if (!user) new NotFoundException();
    return user;
  }

  // 내 정보 수정
  async updateUser({
    userId,
    updateUserDto,
  }: IUsersServiceUpdateUser): Promise<User> {
    const user = await this.findById({ userId });

    if (!user) throw new NotFoundException();

    const updateUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });

    return updateUser;
  }

  // 회원 탈퇴
  async deleteUser({ userId }: IUsersServiceDeleteUser): Promise<void> {
    const user = await this.findById({ userId });
    if (!user) throw new NotFoundException();

    await this.usersRepository.remove(user);
  }

  // 유저 이메일 찾기
  async findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  // 유저 아이디 찾기
  async findById({ userId }: IUsersServiceFindById): Promise<User> {
    return await this.usersRepository.findOne({
      where: { id: userId },
    });
  }
}

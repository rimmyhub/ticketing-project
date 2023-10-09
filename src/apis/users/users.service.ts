import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Point, Repository } from 'typeorm';
import {
  IUsersServiceCreateUser,
  IUsersServiceDeleteUser,
  IUsersServiceFindByEmail,
  IUsersServiceFindById,
  IUsersServiceFindUser,
  IUsersServiceUpdateUser,
} from './interfaces/users-service.interface';
import * as bcrypt from 'bcrypt';
import { PointsService } from '../points/points.service';
import { IPointsServiceCreatePoint } from '../points/interfaces/points-service.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => PointsService))
    private readonly pointsService: PointsService,
  ) {}

  // 유저 생성하기
  async createUser({ createUserDto }: IUsersServiceCreateUser): Promise<User> {
    const { email, password, nickName } = createUserDto;

    const user = await this.findByEmail({ email });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.usersRepository.save({
      email,
      password: hashedPassword,
      nickName,
    });

    // / 가입 축하금 포인트 생성 및 할당
    const createPointDto: IPointsServiceCreatePoint = {
      userId: newUser.id, // 새로 생성한 유저의 ID
      createPointDto: {
        point: 10000000, // 가입 축하금
        reason: '가입 축하금', // 가입 축하금 설명
      },
    };

    // PointsService의 createPoint 메서드를 호출하여 포인트 생성 및 할당
    await this.pointsService.createPoint(createPointDto);

    return newUser;
  }

  // 내 정보 조회
  async findUser({ userId }: IUsersServiceFindUser): Promise<User> {
    const user = await this.findById({ userId });
    if (!user) new NotFoundException('해당 유저를 찾을 수 없습니다.');
    return user;
  }

  // 내 정보 수정
  async updateUser({
    userId,
    updateUserDto,
  }: IUsersServiceUpdateUser): Promise<User> {
    const user = await this.findById({ userId });

    if (!user) throw new NotFoundException('해당 유저를 찾을 수 없습니다.');

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
      relations: ['points'],
    });
  }
}

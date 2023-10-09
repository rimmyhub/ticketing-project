import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { DataSource, Repository } from 'typeorm';
import {
  IPointsServiceCreatePoint,
  IPointsServiceUpdatePoint,
} from './interfaces/points-service.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point)
    private readonly pointsRepository: Repository<Point>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource, // dataSource를 주입
  ) {}

  // 포인트 생성
  async createPoint({
    userId,
    createPointDto,
  }: IPointsServiceCreatePoint): Promise<Point> {
    const queryRunner = this.dataSource.createQueryRunner(); // queryRunner 생성
    await queryRunner.connect(); // 새로운 queryRunner를 연결
    await queryRunner.startTransaction(); // 새로운 트랜잭션을 시작한다는 의미의 코드
    let newPoint;

    try {
      // 기존 포인트 조회
      const existingPoint = await this.pointsRepository.findOne({
        where: { user: { id: userId } },
      });

      if (existingPoint) {
        existingPoint.point += createPointDto.point; // 기존 포인트가 있으면 값 추가
        existingPoint.reason = createPointDto.reason; // 기존 이유에서 업데이트
        await this.pointsRepository.save(existingPoint);
      } else {
        // 기존 포인트가 없는 경우, 새로운 포인트 생성하고 저장
        const newPoint = this.pointsRepository.create({
          user: { id: userId },
          ...createPointDto,
        });
        await this.pointsRepository.save(newPoint);
      }
      await queryRunner.commitTransaction(); // 모든 동작이 정상적으로 수행되었을 경우 커밋을 수행
      return existingPoint || newPoint; // existingPoint 가없으면 newPoint 실행
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // 동작 중간에 에러가 발생할 경우엔 롤백
    } finally {
      await queryRunner.release(); // queryRunner는 생성한 뒤 반드시 release 해줘야함
    }
  }

  // // 포인트 생성
  // async createPoint({
  //   userId,
  //   createPointDto,
  // }: IPointsServiceCreatePoint): Promise<Point> {
  //   const user = await this.usersService.findById({ userId });
  //   if (!user) new NotFoundException('해당 유저를 찾을 수 없습니다.');

  //   return await this.pointsRepository.save({
  //     user: { id: userId },
  //     ...createPointDto,
  //   });
  // }

  // 포인트 수정
  async updatePoint({
    userId,
    pointId,
    updatePointDto,
  }: IPointsServiceUpdatePoint) {
    const user = await this.usersService.findById({ userId });
    if (!user) new NotFoundException('해당 유저를 찾을 수 없습니다.');

    const result = await this.pointsRepository.save({
      user: user,
      pointId,
      ...updatePointDto,
    });

    return result;
  }
}

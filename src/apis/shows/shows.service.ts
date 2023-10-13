import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import {
  IShowsServiceCancelReservationShow,
  IShowsServiceCreateShow,
  IShowsServiceDeleteShow,
  IShowsServiceFindByShowId,
  IShowsServiceFindMyShow,
  IShowsServiceFindOneShow,
  IShowsServiceFindShow,
  IShowsServiceSeatReservationSeat,
  IShowsServiceUpdateShow,
} from './interfaces/shows-service.interface';
import { Show } from './entities/show.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { MessageResDto } from 'src/commons/dto/message-res.dto';
import { SearchReqDto } from 'src/commons/dto/page-req.dto';
import { Seat } from '../seats/entities/seat.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { SeatReservation } from '../reservations/entities/seat-reservation.entity';
import { User } from '../users/entities/user.entity';
import { Point } from '../points/entities/point.entity';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private readonly showsRepository: Repository<Show>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource, // dataSource를 주입
  ) {}

  // 공연 좌석 지정해서 예매
  async seatReservation({
    userId,
    showId,
    createSeatDto,
  }: IShowsServiceSeatReservationSeat) {
    const queryRunner = this.dataSource.createQueryRunner(); // queryRunner 생성
    await queryRunner.connect(); // 새로운 queryRunner를 연결
    await queryRunner.startTransaction(); // 새로운 트랜잭션을 시작한다는 의미의 코드

    try {
      const manager = queryRunner.manager;

      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

      const show = await manager.findOne(Show, { where: { id: showId } });
      if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

      // 예약정보 생성하고 저장
      const reservation = await manager.save(Reservation, {
        user: { id: userId },
        show: { id: showId },
      });

      const userPoint = await manager.findOne(Point, {
        where: {
          user: { id: userId },
        },
      });

      const { price } = createSeatDto; // 가격
      let pointValue = userPoint.point; // 유저의 포인트

      // 유저 포인트가 있을 때 가격보다 적으면 부족하다고 반환
      if (userPoint) {
        if (pointValue < price) {
          await queryRunner.rollbackTransaction();
          throw new Error('사용자의 포인트가 부족합니다.');
        } else {
          // 포인트를 차감
          pointValue -= price;

          // 사용자의 포인트를 업데이트
          await manager.save(Point, userPoint);
        }
      }

      // 좌석 생성하고 저장
      const seat = await manager.save(Seat, {
        user: { id: userId },
        show: { id: showId },
        ...createSeatDto,
      });

      // Seat 엔티티에서 seatId와 일치하는 좌석을 검색
      // 검색된 좌석을 확인하고, 만약 좌석이 존재하지 않으면 롤백하고 예외
      const seatReservations = [];
      for (const seatId of createSeatDto.seatInfo) {
        const seats = await manager.find(Seat, { where: { id: seatId } });
        if (!seats) {
          await queryRunner.rollbackTransaction(); // 롤백
          throw new Error(`${seatId} 좌석 ID를 찾을 수 없습니다.`);
        }

        // 좌석 예약 정보를 생성하고 저장
        const seatReservation = await manager.save(SeatReservation, {
          reservation,
          seat,
          user,
        });
        seatReservations.push(seatReservation);
      }

      await queryRunner.commitTransaction(); // 모든 동작이 정상적으로 수행되었을 경우 커밋을 수행
      return { userPoint, seatReservations };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // 동작 중간에 에러가 발생할 경우엔 롤백
    } finally {
      await queryRunner.release(); // queryRunner는 생성한 뒤 반드시 release 해줘야함
    }
  }

  // 예매 취소
  async cancelReservation({
    userId,
    seatReservationId,
  }: IShowsServiceCancelReservationShow) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const seatReservation = await manager.findOne(SeatReservation, {
        where: { id: seatReservationId },
        relations: ['reservation', 'seat', 'user'],
      });

      if (!seatReservation)
        throw new NotFoundException('예약 내역을 찾을 수 없습니다.');

      if (seatReservation.reservation.isCanceled === true) {
        throw new BadRequestException('이미 취소된 예매 내역입니다.');
      }
      if (seatReservation.user.id !== userId) {
        throw new ForbiddenException('예매를 취소할 권한이 없습니다.');
      }

      // 포인트 반환하기
      const userPoint = await manager.findOne(Point, {
        where: { user: { id: userId } },
      });

      if (!userPoint) {
        throw new NotFoundException('사용자의 포인트 정보를 찾을 수 없습니다.');
      }
      const pointsToReturn = seatReservation.seat.price; // 좌석 가격
      userPoint.point += pointsToReturn; // 사용자 포인트 업데이트
      await manager.save(Point, userPoint);

      // 좌석 예약 정보를 업데이트하여 취소 표시
      await manager.remove(SeatReservation, seatReservation);

      seatReservation.reservation.isCanceled = true;
      await manager.save(Reservation, seatReservation.reservation);

      await queryRunner.commitTransaction(); // 모든 동작이 정상적으로 수행되었을 경우 커밋을 수행
      return {
        message: '예매가 취소되었습니다. 환불된 포인트: ' + pointsToReturn,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 예외 발생 시 롤백
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 공연 검색
  async searchShow({ keyword }: SearchReqDto): Promise<Show[]> {
    const shows = await this.showsRepository
      .createQueryBuilder('show')
      .select([
        'show.title',
        'show.description',
        'show.showTime',
        'show.maxSeats',
      ])
      .where(
        'show.title LIKE :keyword OR show.description LIKE :keyword OR show.showTime LIKE :keyword OR show.maxSeats LIKE :keyword',
        { keyword: `%${keyword}%` },
      )
      .getMany();

    if (shows.length === 0) {
      throw new NotFoundException('검색 결과가 존재하지 않습니다.');
    }

    return shows;
  }

  // 공연 생성
  async createShow({
    createShowDto,
    userId,
  }: IShowsServiceCreateShow): Promise<Show> {
    const user = await this.usersService.findById({ userId });
    if (!user) new NotFoundException('해당 유저를 찾을 수 없습니다.');

    // 현재 시간 기준으로 이전 시간인 경우 생성 거부
    const showTime = new Date(createShowDto.showTime); //Date 객체로 변환

    if (showTime <= new Date())
      throw new BadRequestException('이전 시간의 공연을 생성할 수 없습니다.');

    return await this.showsRepository.save({
      user: { id: userId },
      ...createShowDto,
    });
  }

  // 내가 생성한 공연 조회
  async findAllMyShow({
    userId,
    pageReqDto,
  }: IShowsServiceFindMyShow): Promise<[Show[], number]> {
    const { page, size } = pageReqDto;

    const shows = await this.showsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
      where: { user: { id: userId } },
    });

    if (!shows) new NotFoundException();

    return shows;
  }

  // 공연 조회
  async findAllShow({
    pageReqDto,
  }: IShowsServiceFindShow): Promise<[Show[], number]> {
    const { page, size } = pageReqDto;

    const shows = await this.showsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
    });

    if (!shows) new NotFoundException();

    return shows;
  }

  // 공연 상세 조회
  async findOneShow({ showId }: IShowsServiceFindOneShow): Promise<Show> {
    const show = await this.findByShowId({ showId });

    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    return show;
  }

  // 공연 수정
  async updateShow({ userId, updateShowDto, showId }: IShowsServiceUpdateShow) {
    const show = await this.findByShowId({ showId });

    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    if (show.user.id !== userId)
      throw new ForbiddenException('공연을 수정할 권한이 없습니다.');

    const result = await this.showsRepository.save({
      ...updateShowDto,
    });

    return result;
  }

  // 공연 삭제
  async removeShow({
    showId,
    userId,
  }: IShowsServiceDeleteShow): Promise<MessageResDto> {
    const show = await this.findByShowId({ showId });

    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    if (show.user.id !== userId)
      throw new ForbiddenException('공연을 삭제할 권한이 없습니다');

    await this.showsRepository.remove(show);
    return { message: '공연이 삭제되었습니다.' };
  }

  // 공연 아이디 찾기
  async findByShowId({ showId }: IShowsServiceFindByShowId): Promise<Show> {
    return await this.showsRepository.findOne({
      where: { id: showId },
      relations: ['user', 'seats'],
    });
  }
}

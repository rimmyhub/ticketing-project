import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import {
  IShowsServiceCreateShow,
  IShowsServiceDeleteShow,
  IShowsServiceFindByShowId,
  IShowsServiceFindMyShow,
  IShowsServiceFindOneShow,
  IShowsServiceFindShow,
  IShowsServiceGetAvailableSeat,
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
import { ReservationsService } from '../reservations/reservations.service';
import { SeatsService } from '../seats/seats.service';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private readonly showsRepository: Repository<Show>,
    @InjectRepository(SeatReservation)
    private readonly seatReservationsRepository: Repository<SeatReservation>,
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    @Inject(forwardRef(() => ReservationsService))
    private readonly reservationsService: ReservationsService,
    private readonly usersService: UsersService,
    private readonly seatsService: SeatsService,
    private readonly dataSource: DataSource, // dataSource를 주입
  ) {}

  // // 예매 가능 좌석확인
  // async getAvailableSeats({
  //   userId,
  //   showId,
  // }: IShowsServiceGetAvailableSeat): Promise<Seat[]> {
  //   const show = await this.showsRepository.findOneOrFail({
  //     where: { showId },
  //     relations: ['seats'],
  //   });

  //   const availableSeats = show.seats.filter((seat) => !seat.reserved);
  //   return availableSeats;
  // }

  // 공연 좌석 지정해서 예매
  async seatReservation({
    userId,
    showId,
    createReservationDto,
    createSeatDto,
  }: IShowsServiceSeatReservationSeat) {
    const queryRunner = this.dataSource.createQueryRunner(); // queryRunner 생성
    await queryRunner.connect(); // 새로운 queryRunner를 연결
    await queryRunner.startTransaction(); // 새로운 트랜잭션을 시작한다는 의미의 코드

    try {
      const manager = queryRunner.manager;

      const show = await this.findByShowId({ showId });
      if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

      const user = await this.usersService.findById({ userId });
      if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

      // 예약정보 생성
      const reservation = await this.reservationsService.createReservation({
        userId: userId,
        showId: showId,
        createReservationDto: createReservationDto,
      });

      // 좌석 생성
      const seat = await this.seatsService.createSeat({
        userId: userId,
        showId: showId,
        createSeatDto: createSeatDto,
      });

      // 좌석 예약 정보 생성
      const seatReservations: SeatReservation[] = [];
      for (const seatId of createSeatDto.seatInfo) {
        const seat = await this.seatsService.findBySeatId({ seatId });
        if (!seat) {
          await queryRunner.rollbackTransaction(); // 롤백
          throw new Error(`${seatId} 좌석 ID를 찾을 수 없습니다.`);
        }

        // 좌석 예약 정보 생성
        const seatReservation = this.seatReservationsRepository.create({
          reservation,
          seat,
        });
        seatReservations.push(seatReservation);
      }

      await this.seatReservationsRepository.save(seatReservations); // 좌석 예약 정보 저장

      await queryRunner.commitTransaction(); // 모든 동작이 정상적으로 수행되었을 경우 커밋을 수행
      return reservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // 동작 중간에 에러가 발생할 경우엔 롤백
    } finally {
      await queryRunner.release(); // queryRunner는 생성한 뒤 반드시 release 해줘야함
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

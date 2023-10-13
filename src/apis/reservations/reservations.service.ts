import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository } from 'typeorm';
import {
  IReservationsServiceCreateReservation,
  IReservationsServiceFindAllReservation,
} from './interfaces/reservation-service.interface';
import { ShowsService } from '../shows/shows.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ShowsService))
    private readonly showsService: ShowsService,
  ) {}

  // 좌석 지정 없이 공연 예매
  async createReservation({
    userId,
    showId,
    createReservationDto,
  }: IReservationsServiceCreateReservation): Promise<Reservation> {
    // 유저아이디 조회
    const user = await this.usersService.findById({ userId });
    if (!user) new NotFoundException('해당 유저를 찾을 수 없습니다.');

    // 공연 조회
    const show = await this.showsService.findByShowId({ showId });
    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    // 만약 보유 포인트가 30000보다 작으면 에러 반환
    if (user.points[0].point < 30000)
      throw new ForbiddenException('포인트가 부족합니다.');
    // ForbiddenException 라이언트 요청이 서버에서 거부되는 경우

    // 그게 아니면 포인트 30000을 빼기!
    user.points[0].point -= 30000;

    // 저장
    return await this.reservationsRepository.save({
      user: {
        id: user.id,
        email: user.email,
        nickName: user.nickName,
        points: user.points,
      },
      show: {
        id: show.id,
        title: show.title,
        description: show.description,
        showTime: show.showTime,
      },
      ...createReservationDto,
    });
  }

  // 공연 예매 목록 확인
  async findAllReservation({
    userId,
    pageReqDto,
  }: IReservationsServiceFindAllReservation): Promise<[Reservation[], number]> {
    const { page, size } = pageReqDto;

    const reservation = await this.reservationsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
    });

    // 공연 예매 조회
    if (!reservation) new NotFoundException();

    // 유저아이디 조회
    const user = await this.usersService.findById({ userId });
    if (!user) new NotFoundException('해당 유저를 찾을 수 없습니다.');

    return reservation;
  }
}

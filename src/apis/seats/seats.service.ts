import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import {
  ISeatsServiceCreateSeat,
  ISeatsServiceFindAllSeat,
  ISeatsServiceFindBySeatId,
  ISeatsServiceFindSeatByShowId,
  ISeatsServiceFindSeatByShowIdAndSeatNumberSeat,
} from './interfaces/seats-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { Repository } from 'typeorm';
import { ShowsService } from '../shows/shows.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatsRepository: Repository<Seat>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ShowsService))
    private readonly showsService: ShowsService,
  ) {}

  // 좌석 생성
  async createSeat({
    userId,
    showId,
    createSeatDto,
  }: ISeatsServiceCreateSeat): Promise<Seat[]> {
    const { grade, price, seatNumber } = createSeatDto;

    const user = await this.usersService.findById({ userId });
    if (!user) throw new NotFoundException('해당 유저를 찾을 수 없습니다.');

    const show = await this.showsService.findByShowId({ showId });
    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    // 공연을 생성한 유저와 로그인한 유저가 같지 않을때
    if (show.user.id !== userId)
      throw new ForbiddenException('좌석을 생성할 권한이 없습니다');

    const seat = await this.findSeatByShowAndSeatNumber({
      showId: show.id,
      seatNumber: seatNumber,
    });

    if (seat) throw new BadRequestException('이미 생성된 좌석입니다.');

    const createdSeats: Seat[] = [];

    // 100개 만들기
    for (let seatNumber = 1; seatNumber <= 1; seatNumber++) {
      const newSeat = this.seatsRepository.create({
        show: show,
        seatNumber: seatNumber,
        grade: grade,
        price: price,
      });

      const savedSeat = await this.seatsRepository.save(newSeat);
      createdSeats.push(savedSeat);
    }

    return createdSeats;
  }
  // 해당 공연에 좌석이 이미 생성되어있는지 확인 필요
  // const existingSeat = await this.seatsRepository.findOne({
  //   where: {
  //     grade: grade,
  //     seatNumber: seatNumber,
  //   },
  // });
  // if (existingSeat) {
  //   throw new BadRequestException('이미 생성된 좌석입니다.');
  // }

  // return await this.seatsRepository.save({
  //   user: user,
  //   show: show,
  //   seatNumber: seatNumber,
  //   grade: grade,
  //   price: price,
  // });

  // 공연의 전체 좌석 조회
  async findAllSeat({
    userId,
    showId,
    pageReqDto,
  }: ISeatsServiceFindAllSeat): Promise<[Seat[], number]> {
    const { page, size } = pageReqDto;

    const user = await this.usersService.findById({ userId });
    if (!user) throw new NotFoundException('해당 유저를 찾을 수 없습니다.');

    const show = await this.showsService.findByShowId({ showId });
    if (!show) new NotFoundException('공연을 찾을 수 없습니다.');

    console.log(show);

    const seats = await this.seatsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
    });

    // // 좌석을 조회하고 반환
    // await this.findSeatsByShowId({ showId });
    return seats;
  }

  //해당 공연과 좌석을 조회
  async findSeatByShowAndSeatNumber({
    showId,
    seatNumber,
  }: ISeatsServiceFindSeatByShowIdAndSeatNumberSeat): Promise<Seat> {
    return this.seatsRepository.findOne({
      where: {
        show: { id: showId },
        seatNumber: seatNumber,
      },
    });
  }

  // 공연에 속한 좌석 찾기
  async findSeatsByShowId({
    showId,
  }: ISeatsServiceFindSeatByShowId): Promise<Seat[]> {
    return await this.seatsRepository.find({
      where: { show: { id: showId } },
    });
  }

  // 좌석 아이디 찾기
  async findBySeatId({ seatId }: ISeatsServiceFindBySeatId): Promise<Seat> {
    return await this.seatsRepository.findOne({
      where: { id: seatId },
      relations: ['show'],
    });
  }
}

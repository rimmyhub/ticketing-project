import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { ISeatsServiceCreateSeat } from './interfaces/seat-service.interface';
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
    private readonly showsService: ShowsService,
  ) {}

  async createSeat({ userId, showId, createSeatDto }: ISeatsServiceCreateSeat) {
    const { grade, price, seatNumber } = createSeatDto;

    const user = await this.usersService.findById({ userId });
    if (!user) throw new NotFoundException();

    const show = await this.showsService.findByShowId({ showId });
    if (!show) throw new NotFoundException('공연을 찾을 수 없습니다.');

    if (show.user.id !== userId)
      throw new ForbiddenException('좌석을 생성할 권한이 없습니다');

    const existingSeat = await this.seatsRepository.findOne({
      where: {
        grade: grade,
        seatNumber: seatNumber,
      },
    });
    if (existingSeat) {
      throw new BadRequestException('이미 생성된 좌석입니다.');
    }

    return await this.seatsRepository.save({
      user: user,
      show: show,
      seatNumber: seatNumber,
      grade: grade,
      price: price,
    });
  }
}

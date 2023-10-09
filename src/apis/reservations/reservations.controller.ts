import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { Reservation } from './entities/reservation.entity';
import { PageReqDto } from 'src/commons/dto/page-req.dto';

@Controller('/api/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // 좌석 지정 없이 공연 예매
  @UseGuards(AccessAuthGuard)
  @Post(':showId')
  async createReservation(
    @User() user: UserAfterAuth,
    @Param('showId') showId: string,
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationsService.createReservation({
      userId: user.id,
      showId,
      createReservationDto,
    });
    return reservation;
  }

  // 공연 예매 목록 확인
  @UseGuards(AccessAuthGuard)
  @Get()
  async findAllReservation(
    @User() user: UserAfterAuth,
    @Query() pageReqDto: PageReqDto,
  ): Promise<[Reservation[], number]> {
    return await this.reservationsService.findAllReservation({
      userId: user.id,
      pageReqDto,
    });
  }
}

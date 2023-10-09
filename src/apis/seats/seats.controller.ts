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
import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { Seat } from './entities/seat.entity';
import { PageReqDto } from 'src/commons/dto/page-req.dto';

@Controller('api/seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  // 좌석 생성
  @UseGuards(AccessAuthGuard)
  @Post(':showId')
  async createSeat(
    @User() user: UserAfterAuth,
    @Param('showId') showId: string,
    @Body() createSeatDto: CreateSeatDto,
  ): Promise<Seat[]> {
    const seat = await this.seatsService.createSeat({
      userId: user.id,
      showId,
      createSeatDto,
    });
    return seat;
  }

  // 공연의 전체 좌석 조회
  @UseGuards(AccessAuthGuard)
  @Get(':showId')
  async findAllSeat(
    @User() user: UserAfterAuth,
    @Param('showId') showId: string,
    @Query() pageReqDto: PageReqDto,
  ): Promise<[Seat[], number]> {
    const seat = await this.seatsService.findAllSeat({
      userId: user.id,
      showId,
      pageReqDto,
    });
    return seat;
  }
}

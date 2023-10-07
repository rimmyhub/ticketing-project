import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { Seat } from './entities/seat.entity';

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
  ): Promise<Seat> {
    const seat = await this.seatsService.createSeat({
      userId: user.id,
      showId,
      createSeatDto,
    });
    return seat;
  }
}

import { Module } from '@nestjs/common';
import { SeatReservationsService } from './seat-reservations.service';
import { SeatReservationsController } from './seat-reservations.controller';

@Module({
  controllers: [SeatReservationsController],
  providers: [SeatReservationsService],
})
export class SeatReservationsModule {}

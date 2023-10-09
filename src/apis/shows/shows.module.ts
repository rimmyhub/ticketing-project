import { Module, forwardRef } from '@nestjs/common';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import { UsersModule } from '../users/users.module';
import { SeatReservation } from '../reservations/entities/seat-reservation.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Seat } from '../seats/entities/seat.entity';
import { ReservationsModule } from '../reservations/reservations.module';
import { SeatsModule } from '../seats/seats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Show, SeatReservation, Reservation]),
    forwardRef(() => ReservationsModule),
    UsersModule,
    SeatsModule,
  ],
  controllers: [ShowsController],
  providers: [ShowsService],
  exports: [ShowsService],
})
export class ShowsModule {}

import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  create(createReservationDto: CreateReservationDto) {
    return 'This action adds a new reservation';
  }
}

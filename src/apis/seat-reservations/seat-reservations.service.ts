import { Injectable } from '@nestjs/common';
import { CreateSeatReservationDto } from './dto/create-seat-reservation.dto';
import { UpdateSeatReservationDto } from './dto/update-seat-reservation.dto';

@Injectable()
export class SeatReservationsService {
  create(createSeatReservationDto: CreateSeatReservationDto) {
    return 'This action adds a new seatReservation';
  }

  findAll() {
    return `This action returns all seatReservations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seatReservation`;
  }

  update(id: number, updateSeatReservationDto: UpdateSeatReservationDto) {
    return `This action updates a #${id} seatReservation`;
  }

  remove(id: number) {
    return `This action removes a #${id} seatReservation`;
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeatReservationsService } from './seat-reservations.service';
import { CreateSeatReservationDto } from './dto/create-seat-reservation.dto';
import { UpdateSeatReservationDto } from './dto/update-seat-reservation.dto';

@Controller('seat-reservations')
export class SeatReservationsController {
  constructor(private readonly seatReservationsService: SeatReservationsService) {}

  @Post()
  create(@Body() createSeatReservationDto: CreateSeatReservationDto) {
    return this.seatReservationsService.create(createSeatReservationDto);
  }

  @Get()
  findAll() {
    return this.seatReservationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seatReservationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeatReservationDto: UpdateSeatReservationDto) {
    return this.seatReservationsService.update(+id, updateSeatReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seatReservationsService.remove(+id);
  }
}

import { CreateSeatDto } from '../dto/create-seat.dto';

export interface ISeatsServiceCreateSeat {
  userId: string;
  showId: string;
  createSeatDto: CreateSeatDto;
}

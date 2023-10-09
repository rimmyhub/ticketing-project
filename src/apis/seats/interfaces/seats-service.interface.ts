import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { CreateSeatDto } from '../dto/create-seat.dto';
export interface ISeatsServiceCreateSeat {
  userId: string;
  showId: string;
  createSeatDto: CreateSeatDto;
}

export interface ISeatsServiceFindAllSeat {
  userId: string;
  showId: string;
  pageReqDto: PageReqDto;
}

export interface ISeatsServiceFindSeatByShowId {
  showId: string;
}

export interface ISeatsServiceFindBySeatId {
  seatId: string;
}

export interface ISeatsServiceFindSeatByShowIdAndSeatNumberSeat {
  showId: string;
  seatNumber: number;
}

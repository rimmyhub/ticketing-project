import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';

export interface IReservationsServiceCreateReservation {
  userId: string;
  showId: string;
  createReservationDto: CreateReservationDto;
}

export interface IReservationsServiceFindAllReservation {
  userId: string;
  pageReqDto: PageReqDto;
}

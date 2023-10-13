import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { CreateShowDto } from '../dto/create-show.dto';
import { UpdateShowDto } from '../dto/update-show.dto';
import { SearchReqDto } from 'src/commons/dto/page-req.dto';
import { CreateReservationDto } from 'src/apis/reservations/dto/create-reservation.dto';
import { CreateSeatDto } from 'src/apis/seats/dto/create-seat.dto';

export interface IShowsServiceCreateShow {
  userId: string;
  createShowDto: CreateShowDto;
}

export interface IShowsServiceFindMyShow {
  userId: string;
  pageReqDto: PageReqDto;
}

export interface IShowsServiceFindOneShow {
  showId: string;
}

export interface IShowsServiceFindByShowId {
  showId: string;
}

export interface IShowsServiceUpdateShow {
  userId: string;
  showId: string;
  updateShowDto: UpdateShowDto;
}

export interface IShowsServiceFindShow {
  pageReqDto: PageReqDto;
}

export interface IShowsServiceDeleteShow {
  userId: string;
  showId: string;
}

export interface IShowsServiceGetAvailableSeat {
  userId: string;
  showId: string;
}

export interface IShowsServiceSeatReservationSeat {
  userId: string;
  showId: string;
  createSeatDto: CreateSeatDto;
}

export interface IShowsServiceCancelReservationShow {
  userId: string;
  seatReservationId: string;
}

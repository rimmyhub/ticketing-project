import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { CreateShowDto } from '../dto/create-show.dto';
import { UpdateShowDto } from '../dto/update-show.dto';

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

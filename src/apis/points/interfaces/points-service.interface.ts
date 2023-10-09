import { CreatePointDto } from '../dto/create-point.dto';
import { UpdatePointDto } from '../dto/update-point.dto';

export interface IPointsServiceCreatePoint {
  userId: string;
  createPointDto: CreatePointDto;
}

export interface IPointsServiceUpdatePoint {
  userId: string;
  pointId: string;
  updatePointDto: UpdatePointDto;
}

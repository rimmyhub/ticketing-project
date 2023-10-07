import { CreatePointDto } from '../dto/create-point.dto';

export interface IPointsServiceCreatePoint {
  userId: string;
  createPointDto: CreatePointDto;
}

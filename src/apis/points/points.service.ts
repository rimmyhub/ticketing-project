import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { Repository } from 'typeorm';
import { IPointsServiceCreatePoint } from './interfaces/points-service.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point)
    private readonly pointsRepository: Repository<Point>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async createPoint({
    userId,
    createPointDto,
  }: IPointsServiceCreatePoint): Promise<Point> {
    const user = await this.usersService.findById({ userId });
    if (!user) new NotFoundException();

    return await this.pointsRepository.save({
      user: { id: userId },
      ...createPointDto,
    });
  }
}

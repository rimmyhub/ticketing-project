import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { Point } from './entities/point.entity';

@Controller('api/points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  // 포인트 생성
  @UseGuards(AccessAuthGuard)
  @Post()
  async createPoint(
    @User() user: UserAfterAuth,
    @Body() createPointDto: CreatePointDto,
  ): Promise<Point> {
    const point = await this.pointsService.createPoint({
      userId: user.id,
      createPointDto,
    });
    return point;
  }
}

import { Module, forwardRef } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Point]),
    forwardRef(() => UsersModule), // forwardRef를 사용하여 UsersModule 가져오기
  ],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}

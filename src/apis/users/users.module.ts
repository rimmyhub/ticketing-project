import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => PointsModule), // forwardRef를 사용하여 PointsModule 가져오기
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

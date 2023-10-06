import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { UsersModule } from '../users/users.module';
import { ShowsModule } from '../shows/shows.module';

@Module({
  imports: [TypeOrmModule.forFeature([Seat]), UsersModule, ShowsModule],
  controllers: [SeatsController],
  providers: [SeatsService],
  exports: [SeatsService],
})
export class SeatsModule {}

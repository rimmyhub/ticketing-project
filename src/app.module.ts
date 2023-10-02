import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './apis/users/users.module';
import { PointsModule } from './apis/points/points.module';
import { ShowsModule } from './apis/shows/shows.module';
import { ReservationsModule } from './apis/reservations/reservations.module';
import { SeatsModule } from './apis/seats/seats.module';
import { SeatReservationsModule } from './apis/seat-reservations/seat-reservations.module';
import { AuthModule } from './apis/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PointsModule,
    ShowsModule,
    ReservationsModule,
    SeatsModule,
    SeatReservationsModule,
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
      timezone: 'Asia/Seoul',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

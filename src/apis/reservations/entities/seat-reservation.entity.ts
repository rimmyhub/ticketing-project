import { Reservation } from 'src/apis/reservations/entities/reservation.entity';
import { Seat } from 'src/apis/seats/entities/seat.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SeatReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Reservation, (reservation) => reservation.seatReservations, {
    onDelete: 'CASCADE',
  })
  reservation: Reservation;

  @ManyToOne(() => Seat, (seat) => seat.seatReservations, {
    onDelete: 'CASCADE',
  })
  seat: Seat;
}

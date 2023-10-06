import { SeatReservation } from 'src/apis/reservations/entities/seat-reservation.entity';
import { Show } from 'src/apis/shows/entities/show.entity';
import { GRADE } from 'src/commons/enum/seat.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seatNumber: number;

  @Column({ type: 'enum', enum: GRADE })
  grade: GRADE;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Show, (show) => show.seats, { onDelete: 'CASCADE' })
  show: Show;

  @OneToMany(() => SeatReservation, (seatReservation) => seatReservation.seat, {
    cascade: true,
  })
  seatReservations: SeatReservation;
}

import { Point } from 'src/apis/points/entities/point.entity';
import { SeatReservation } from 'src/apis/reservations/entities/seat-reservation.entity';
import { Show } from 'src/apis/shows/entities/show.entity';
import { User } from 'src/apis/users/entities/user.entity';
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
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isCanceled: Boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Point, (point) => point.reservation, { cascade: true })
  points: Point[];

  @ManyToOne(() => Show, (show) => show.reservations, { onDelete: 'CASCADE' })
  show: Show;

  @OneToMany(
    () => SeatReservation,
    (seatReservation) => seatReservation.reservation,
    { cascade: true },
  )
  seatReservations: SeatReservation[];
}

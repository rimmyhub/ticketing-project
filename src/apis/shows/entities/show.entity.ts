import { Reservation } from 'src/apis/reservations/entities/reservation.entity';
import { Seat } from 'src/apis/seats/entities/seat.entity';
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
export class Show {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  showTime: Date;

  @Column()
  maxSeats: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.show, {
    cascade: true,
  })
  reservations: Reservation[];

  @OneToMany(() => Seat, (seat) => seat.show, { cascade: true })
  seats: Seat[];

  @ManyToOne(() => User, (user) => user.shows, { onDelete: 'CASCADE' })
  user: User;
}

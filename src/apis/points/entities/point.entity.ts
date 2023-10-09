import { Reservation } from 'src/apis/reservations/entities/reservation.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Point {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  point: number;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.points, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Reservation, (reservation) => reservation.points, {
    onDelete: 'CASCADE',
  })
  reservation: Reservation;
}

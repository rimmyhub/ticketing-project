import { Point } from 'src/apis/points/entities/point.entity';
import { Reservation } from 'src/apis/reservations/entities/reservation.entity';
import { Show } from 'src/apis/shows/entities/show.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  nickName: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Point, (point) => point.user, { cascade: true })
  points: Point[];

  @OneToMany(() => Reservation, (reservation) => reservation.user, {
    cascade: true,
  })
  reservations: Reservation[];

  @OneToMany(() => Show, (show) => show.user, { cascade: true }) shows: Show[];
}

import { IsInt, IsNotEmpty } from 'class-validator';
import { GRADE } from 'src/commons/enum/seat.enum';

export class CreateSeatDto {
  @IsNotEmpty()
  @IsInt()
  seatNumber: number;

  @IsNotEmpty()
  grade: GRADE;

  @IsNotEmpty()
  @IsInt()
  price: number;
}

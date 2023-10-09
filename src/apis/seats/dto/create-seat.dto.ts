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

  @IsNotEmpty()
  seatInfo: string[]; // 좌석 정보를 나타내는 문자열 배열
}

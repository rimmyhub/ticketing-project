import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSeatDto {
  @IsNotEmpty()
  @IsInt()
  seatNumber: number;

  @IsNotEmpty()
  @IsString()
  grade: string;

  @IsNotEmpty()
  @IsInt()
  price: number;

  @IsNotEmpty()
  seatInfo: string[]; // 좌석 정보를 나타내는 문자열 배열
}

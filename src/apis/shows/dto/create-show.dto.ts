import { IsInt, IsNotEmpty, IsNumber, IsString, Max } from 'class-validator';

export class CreateShowDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  showTime: Date;

  @IsNotEmpty()
  @IsInt() // 값이 정수인지 확인
  @Max(600) // 최대 숫자를 600으로 설정
  maxSeats: number;
}

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10) // 최대 글자수
  nickname: string;

  @IsString()
  imageUrl: string;
}

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1) // 최소 글자수
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10) // 최대 글자수
  nickName: string;
}

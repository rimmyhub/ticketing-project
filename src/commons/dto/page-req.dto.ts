import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class PageReqDto {
  @Transform((param) => Number(param.value))
  @IsInt()
  page?: number = 1;

  @Transform((param) => Number(param.value))
  @IsInt()
  size?: number = 10;
}

// export class CountReqDto {
//   @Transform((param) => Number(param.value))
//   @IsInt()
//   count?: number = 15;
// }

export class SearchReqDto extends PageReqDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}

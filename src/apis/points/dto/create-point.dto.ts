import { IsNotEmpty } from 'class-validator';

export class CreatePointDto {
  @IsNotEmpty()
  point: number;

  @IsNotEmpty()
  reason: string;
}

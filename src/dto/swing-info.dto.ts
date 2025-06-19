import { IsNotEmpty, IsString, IsOptional, IsDate, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSwingInfoDto {
  @IsOptional()
  @IsString()
  teacher?: string;

  @IsOptional()
  @IsString()
  line?: string;

  @IsOptional()
  @IsString()
  dj?: string;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endTime?: Date;

  @IsNotEmpty()
  @IsString()
  place: string;

  @IsNotEmpty()
  @IsString()
  club: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  generation?: number;

  @IsOptional()
  @IsString()
  etc?: string;
}

export class GetInfoDto {
  action: {
    params: {
      generation: number;
    };
  };
} 
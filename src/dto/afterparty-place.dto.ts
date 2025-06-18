import { IsNotEmpty, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAfterpartyPlaceDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNotEmpty()
  @IsString()
  jitterbug: string;

  @IsNotEmpty()
  @IsString()
  regularFirst: string;

  @IsNotEmpty()
  @IsString()
  regularSecond: string;

  @IsNotEmpty()
  @IsString()
  afterRegular: string;
}

export class RegisterAfterpartyPlaceDto {
  action: {
    params: {
      jitterbug: string;
      'regular-first': string;
      'regular-second': string;
      'after-regular': string;
    };
  };
}

export class AfterpartyPlaceResponseDto {
  jitterbug: string;
  'regular-first': string;
  'regular-second': string;
  'after-regular': string;
  nodata?: string;
} 
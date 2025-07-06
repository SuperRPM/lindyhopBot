import { IsNumber, IsArray, IsOptional, IsString, IsObject } from 'class-validator';

export class ClassInfoDto {
  id: number;
  name: string;
  members: string[];
}

export class ClassListResponseDto {
  gen: number;
  classes: ClassInfoDto[];
}

export class SettlementSaveDto {
  @IsOptional()
  @IsNumber()
  gen?: number;

  @IsOptional()
  @IsNumber()
  class?: number;

  @IsOptional()
  @IsString()
  id?: string;

  @IsObject()
  members: {
    all: string[];
    food: string[];
    alcohol: string[];
    beverage: string[];
  };

  @IsObject()
  amount: {
    food: number;
    alcohol: number;
    beverage: number;
  };
}

export class SettlementLoadResponseDto {
  members: {
    all: string[];
    food: string[];
    alcohol: string[];
    beverage: string[];
  };
  amount: {
    food: number;
    alcohol: number;
    beverage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class SettlementResultItemDto {
  member: string;
  total: number;
  food: number;
  alcohol: number;
  beverage: number;
}

export class SettlementResultResponseDto extends Array<SettlementResultItemDto> {} 
import { IsString, IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  image: string;
} 
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, IsDate, IsInt } from 'class-validator';

@Entity()
export class SwingInfo {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  teacher: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  line: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  dj: string;

  @Column()
  @IsDate()
  startTime: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  endTime: Date;

  @Column()
  @IsNotEmpty()
  @IsString()
  place: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  club: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  generation: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  etc: string;
} 
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';

@Entity()
export class AfterpartyPlace {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column()
  @IsDate()
  date: Date;

  @Column()
  @IsNotEmpty()
  @IsString()
  jitterbug: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  regularFirst: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  regularSecond: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  afterRegular: string;
} 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ClassInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  generation: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  members: string; // JSON 배열로 저장 ["김철수", "이영희", "모든사람"]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
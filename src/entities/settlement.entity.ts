import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Settlement {
  @PrimaryColumn()
  id: string; // "s1341001" 형식

  @Column()
  generation: number;

  @Column({ name: 'class_number' })
  classNumber: number;

  @Column({ type: 'text', nullable: true })
  allMembers: string; // JSON 배열로 저장 ["김철수", "이영희", "모든사람"]

  @Column({ type: 'text', nullable: true })
  foodMembers: string; // JSON 배열로 저장 ["김철수", "이영희"]

  @Column({ type: 'text', nullable: true })
  alcoholMembers: string; // JSON 배열로 저장

  @Column({ type: 'text', nullable: true })
  beverageMembers: string; // JSON 배열로 저장

  @Column({ default: 0 })
  foodTotal: number;

  @Column({ default: 0 })
  alcoholTotal: number;

  @Column({ default: 0 })
  beverageTotal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
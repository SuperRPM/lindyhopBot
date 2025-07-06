import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ReceiptImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column({ type: 'text', nullable: true })
  analysisResult: string; // JSON 문자열로 저장

  @Column({ nullable: true })
  settlementId: string; // 정산 ID와 연결

  @Column({ nullable: true })
  generation: number; // 기수 정보

  @Column({ nullable: true })
  classNumber: number; // 클래스 번호 (0~3)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
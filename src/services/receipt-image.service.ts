import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceiptImage } from '../entities/receipt-image.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReceiptImageService {
  private readonly uploadDir = 'uploads/receipts';

  constructor(
    @InjectRepository(ReceiptImage)
    private receiptImageRepository: Repository<ReceiptImage>,
  ) {
    // 업로드 디렉토리 생성
    this.ensureUploadDirectory();
  }

  // 업로드 디렉토리 생성
  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // 영수증 이미지 저장
  async saveReceiptImage(
    imageBase64: string, 
    originalName: string, 
    mimeType: string,
    analysisResult?: any,
    settlementId?: string,
    generation?: number,
    classNumber?: number
  ): Promise<ReceiptImage> {
    try {
      // base64 헤더 제거
      let imageData = imageBase64;
      if (imageData.startsWith('data:image/')) {
        imageData = imageData.split(',')[1];
      }

      // 파일명 생성 (timestamp + original name)
      const timestamp = Date.now();
      const extension = path.extname(originalName) || '.jpg';
      const filename = `receipt_${timestamp}${extension}`;
      const filePath = path.join(this.uploadDir, filename);

      // base64를 파일로 저장
      const buffer = Buffer.from(imageData, 'base64');
      fs.writeFileSync(filePath, buffer);

      // 데이터베이스에 저장
      const receiptImage = this.receiptImageRepository.create({
        filename,
        originalName,
        mimeType,
        size: buffer.length,
        analysisResult: analysisResult ? JSON.stringify(analysisResult) : null,
        settlementId,
        generation,
        classNumber
      });

      return await this.receiptImageRepository.save(receiptImage);
    } catch (error) {
      console.error('영수증 이미지 저장 오류:', error);
      throw new HttpException('영수증 이미지 저장 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 영수증 이미지 조회
  async getReceiptImage(id: number): Promise<ReceiptImage> {
    try {
      const receiptImage = await this.receiptImageRepository.findOne({ where: { id } });
      
      if (!receiptImage) {
        throw new HttpException('영수증 이미지를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      return receiptImage;
    } catch (error) {
      console.error('영수증 이미지 조회 오류:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('영수증 이미지 조회 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 정산 ID로 영수증 이미지 조회
  async getReceiptImagesBySettlementId(settlementId: string): Promise<ReceiptImage[]> {
    try {
      return await this.receiptImageRepository.find({
        where: { settlementId },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      console.error('정산별 영수증 이미지 조회 오류:', error);
      throw new HttpException('정산별 영수증 이미지 조회 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 어드민용: 모든 영수증 이미지 조회 (페이지네이션)
  async getAllReceiptImages(page: number = 1, limit: number = 20): Promise<{
    images: ReceiptImage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [images, total] = await this.receiptImageRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      });

      return {
        images,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('영수증 이미지 목록 조회 오류:', error);
      throw new HttpException('영수증 이미지 목록 조회 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 어드민용: generation과 classNumber로 영수증 이미지 조회
  async getReceiptImagesByGenerationAndClass(
    generation: number, 
    classNumber: number,
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    images: ReceiptImage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [images, total] = await this.receiptImageRepository.findAndCount({
        where: { generation, classNumber },
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      });

      return {
        images,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('기수/클래스별 영수증 이미지 조회 오류:', error);
      throw new HttpException('기수/클래스별 영수증 이미지 조회 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 영수증 이미지 파일 경로 가져오기
  getImageFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  // 영수증 이미지 삭제
  async deleteReceiptImage(id: number): Promise<void> {
    try {
      const receiptImage = await this.getReceiptImage(id);
      
      // 파일 삭제
      const filePath = this.getImageFilePath(receiptImage.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // 데이터베이스에서 삭제
      await this.receiptImageRepository.remove(receiptImage);
    } catch (error) {
      console.error('영수증 이미지 삭제 오류:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('영수증 이미지 삭제 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiReceiptService } from '../services/ai-receipt.service';
import { ReceiptAnalysisDto } from '../dto/receipt.dto';

@Controller('api')
export class ReceiptController {
  constructor(private readonly aiReceiptService: AiReceiptService) {}

  @Post('analyze-receipt')
  async analyzeReceipt(@Body() request: ReceiptAnalysisDto) {
    try {
      console.log('Receipt analysis request received');
      console.log('Request object:', request);
      console.log('Request type:', typeof request);
      console.log('Request keys:', Object.keys(request || {}));
      console.log('imageBase64 exists:', !!request?.imageBase64);
      console.log('imageBase64 type:', typeof request?.imageBase64);
      console.log('imageBase64 length:', request?.imageBase64?.length);
      
      // 요청 검증
      if (!request.imageBase64) {
        console.log('❌ imageBase64 is falsy');
        throw new HttpException({
          success: false,
          message: '이미지 데이터가 필요합니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      console.log('✅ imageBase64 validation passed');

      // base64 데이터 검증
      if (!request.imageBase64.startsWith('data:image/') && 
          !/^[A-Za-z0-9+/]*={0,2}$/.test(request.imageBase64)) {
        console.log('❌ Invalid base64 format');
        throw new HttpException({
          success: false,
          message: '올바른 base64 이미지 형식이 아닙니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      console.log('✅ base64 format validation passed');

      // base64 헤더 제거 (있는 경우)
      let imageData = request.imageBase64;
      if (imageData.startsWith('data:image/')) {
        imageData = imageData.split(',')[1];
      }

      console.log('Image data length (after header removal):', imageData.length);

      // AI 분석 실행
      const result = await this.aiReceiptService.analyzeReceipt(imageData);
      
      console.log('Receipt analysis completed successfully');
      return result;

    } catch (error) {
      console.error('Receipt analysis error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        message: '영수증 분석 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('test-receipt')
  async testReceipt() {
    return {
      success: true,
      message: '영수증 분석 API가 정상적으로 작동합니다.',
      data: {
        totalAmount: 0,
        categories: {
          안주: { items: [], total: 0 },
          주류: { items: [], total: 0 },
          음료: { items: [], total: 0 }
        }
      }
    };
  }
} 
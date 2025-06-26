import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UploadImageDto } from '../dto/upload.dto';

@Controller('api')
export class UploadController {
  @Post('upload-image')
  async uploadImage(@Body() uploadImageDto: UploadImageDto) {
    try {
      // 이미지 데이터가 비어있지 않은지 확인
      if (uploadImageDto.image.trim() === '') {
        throw new HttpException({
          success: false,
          message: '이미지 데이터가 비어있습니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      // TODO: 여기에 실제 이미지 처리 로직을 추가할 수 있습니다
      // 예: 파일 저장, 이미지 리사이징, 클라우드 스토리지 업로드 등

      return {
        success: true,
        message: '이미지가 잘 전달됐습니다.',
        data: {
          receivedAt: new Date().toISOString(),
          imageSize: uploadImageDto.image.length, // base64 문자열의 길이
        }
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        message: '이미지 업로드 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
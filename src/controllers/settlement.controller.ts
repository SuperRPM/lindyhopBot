import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SettlementService } from '../services/settlement.service';
import { ClassInfoService } from '../services/class-info.service';
import { SettlementSaveDto } from '../dto/settlement.dto';

@Controller('api')
export class SettlementController {
  constructor(
    private readonly settlementService: SettlementService,
    private readonly classInfoService: ClassInfoService,
  ) {}

  // 클래스 선택 초기값 불러오기
  @Get('class')
  async getClasses(@Query('gen') gen: string) {
    try {
      const generation = parseInt(gen);
      
      if (isNaN(generation)) {
        throw new HttpException({
          success: false,
          message: 'gen은 숫자여야 합니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      console.log(`클래스 목록 조회: generation=${generation}`);
      
      const result = await this.classInfoService.getClassesByGeneration(generation);
      
      return result;
    } catch (error) {
      console.error('클래스 목록 조회 컨트롤러 오류:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        message: '클래스 목록 조회 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 정산 결과 저장하기 (create, modify 겸용)
  @Post('settlement/save')
  async saveSettlement(@Body() saveDto: SettlementSaveDto) {
    try {
      console.log('정산 저장 요청:', saveDto);
      
      const result = await this.settlementService.saveSettlement(saveDto);
      
      return result;
    } catch (error) {
      console.error('정산 저장 컨트롤러 오류:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        message: '정산 저장 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 정산 결과 불러오기
  @Get('settlement/load')
  async loadSettlement(@Query('id') id: string) {
    try {
      if (!id) {
        throw new HttpException({
          success: false,
          message: 'id는 필수입니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      console.log(`정산 로드: id=${id}`);
      
      const result = await this.settlementService.loadSettlement(id);
      
      return result;
    } catch (error) {
      console.error('정산 로드 컨트롤러 오류:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        message: '정산 로드 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 최종 정산 결과 계산하기
  @Get('settlement/result')
  async getSettlementResult(@Query('id') id: string) {
    try {
      if (!id) {
        throw new HttpException({
          success: false,
          message: 'id는 필수입니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      console.log(`정산 결과 계산: id=${id}`);
      
      const result = await this.settlementService.getSettlementResult(id);
      
      return result;
    } catch (error) {
      console.error('정산 결과 계산 컨트롤러 오류:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        message: '정산 결과 계산 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { SwingInfoService } from '../services/swing-info.service';
import { CreateSwingInfoDto, UpdateSwingInfoDto } from '../dto/swing-info.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly swingInfoService: SwingInfoService) {}

  @Post('login')
  async login(@Body() loginDto: { password: string }) {
    try {
      if (loginDto.password !== '134431') {
        throw new HttpException({
          success: false,
          message: '비밀번호가 올바르지 않습니다.'
        }, HttpStatus.UNAUTHORIZED);
      }

      return {
        success: true,
        message: '로그인 성공'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: '로그인에 실패했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('swing-info')
  async getSwingInfoList() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const allEvents = await this.swingInfoService.findAll();
      
      // 오늘 이후의 이벤트만 필터링
      const futureEvents = allEvents.filter(event => 
        new Date(event.startTime) >= today
      );

      return {
        success: true,
        data: futureEvents
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: '스케줄 목록을 불러오는데 실패했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('swing-info')
  async createSwingInfo(@Body() createSwingInfoDto: CreateSwingInfoDto) {
    try {
      const result = await this.swingInfoService.create(createSwingInfoDto);
      return {
        success: true,
        data: result,
        message: '스케줄이 성공적으로 생성되었습니다.'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: '스케줄 생성에 실패했습니다.'
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('swing-info/:id')
  async updateSwingInfo(@Param('id') id: number, @Body() updateSwingInfoDto: UpdateSwingInfoDto) {
    try {
      const result = await this.swingInfoService.update(id, updateSwingInfoDto);
      
      if (!result) {
        throw new HttpException({
          success: false,
          message: '해당 ID의 스케줄을 찾을 수 없습니다.'
        }, HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: result,
        message: '스케줄이 성공적으로 수정되었습니다.'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: '스케줄 수정에 실패했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('swing-info/:id')
  async deleteSwingInfo(@Param('id') id: number) {
    try {
      const existingInfo = await this.swingInfoService.findOne(id);
      if (!existingInfo) {
        throw new HttpException({
          success: false,
          message: '해당 ID의 스케줄을 찾을 수 없습니다.'
        }, HttpStatus.NOT_FOUND);
      }

      await this.swingInfoService.delete(id);

      return {
        success: true,
        message: '스케줄이 성공적으로 삭제되었습니다.'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: '스케줄 삭제에 실패했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
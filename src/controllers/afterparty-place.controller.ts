import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AfterpartyPlaceService } from '../services/afterparty-place.service';
import { CreateAfterpartyPlaceDto } from '../dto/afterparty-place.dto';

@Controller('api/afterparty-places')
export class AfterpartyPlaceController {
  constructor(private readonly afterpartyPlaceService: AfterpartyPlaceService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    console.log('=== REGISTER REQUEST RECEIVED ===');
    console.log('Request body:', JSON.stringify(registerDto, null, 2));
    
    try {
      // 요청 바디 구조 확인
      if (!registerDto || !registerDto.action || !registerDto.action.params) {
        console.error('Invalid request body structure:', registerDto);
        throw new HttpException({
          version: "2.0",
          data: "Invalid request body structure"
        }, HttpStatus.BAD_REQUEST);
      }

      const createDto: CreateAfterpartyPlaceDto = {
        date: new Date(),
        jitterbug: registerDto.action.params.jitterbug || '',
        regularFirst: registerDto.action.params['regular-first'] || '',
        regularSecond: registerDto.action.params['regular-second'] || '',
        afterRegular: registerDto.action.params['after-regular'] || ''
      };

      console.log('Creating DTO:', JSON.stringify(createDto, null, 2));

      const result = await this.afterpartyPlaceService.create(createDto);
      console.log('Created result:', result);
      
      return {
        version: "2.0",
        data: result
      };
    } catch (error) {
      console.error('Register error:', error);
      throw new HttpException({
        version: "2.0",
        data: "Failed to register afterparty place"
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('search')
  async search() {
    console.log('=== SEARCH REQUEST RECEIVED ===');
    try {
      const result = await this.afterpartyPlaceService.getTodayInfo();
      console.log('Search result:', result);
      return {
        version: "2.0",
        data: result
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new HttpException({
        version: "2.0",
        data: "Failed to search afterparty places"
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
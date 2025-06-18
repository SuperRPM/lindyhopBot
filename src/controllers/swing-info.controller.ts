import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { SwingInfoService } from '../services/swing-info.service';
import { CreateSwingInfoDto } from '../dto/swing-info.dto';

@Controller('api')
export class SwingInfoController {
  constructor(private readonly swingInfoService: SwingInfoService) {}

  @Post('createInfo')
  async createInfo(@Body() createSwingInfoDto: CreateSwingInfoDto) {
    try {
      const result = await this.swingInfoService.create(createSwingInfoDto);
      return {
        version: "2.0",
        data: result
      };
    } catch (error) {
      throw new HttpException({
        version: "2.0",
        data: "Failed to create info"
      }, HttpStatus.BAD_REQUEST);
    }
  }



  @Post('getInfo')
  async getInfo(@Body() getInfoDto: any) {
    try {
      console.log('=== GETINFO REQUEST RECEIVED ===');
      console.log('Request body:', JSON.stringify(getInfoDto, null, 2));
      
      // generation 파라미터 확인
      if (!getInfoDto || !getInfoDto.action || !getInfoDto.action.params || !getInfoDto.action.params.generation) {
        console.error('Invalid request body structure:', getInfoDto);
        throw new HttpException({
          version: "2.0",
          data: "Invalid request body structure - generation parameter required"
        }, HttpStatus.BAD_REQUEST);
      }

      const generation = getInfoDto.action.params.generation;
      console.log('Generation:', generation);
      
      const result = await this.swingInfoService.getInfoByGeneration(generation);
      console.log('Result:', result);
      
      return {
        version: "2.0",
        data: {
          schedule: result
        }
      };
    } catch (error) {
      console.error('GetInfo error:', error);
      throw new HttpException({
        version: "2.0",
        data: "Failed to get info"
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
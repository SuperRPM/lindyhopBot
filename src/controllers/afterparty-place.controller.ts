import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AfterpartyPlaceService } from '../services/afterparty-place.service';
import { RegisterAfterpartyPlaceDto, CreateAfterpartyPlaceDto } from '../dto/afterparty-place.dto';

@Controller('api/afterparty-places')
export class AfterpartyPlaceController {
  constructor(private readonly afterpartyPlaceService: AfterpartyPlaceService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterAfterpartyPlaceDto) {
    try {
      const createDto: CreateAfterpartyPlaceDto = {
        date: new Date(),
        jitterbug: registerDto.action.params.jitterbug,
        regularFirst: registerDto.action.params['regular-first'],
        regularSecond: registerDto.action.params['regular-second'],
        afterRegular: registerDto.action.params['after-regular']
      };

      const result = await this.afterpartyPlaceService.create(createDto);
      return {
        version: "2.0",
        data: result
      };
    } catch (error) {
      throw new HttpException({
        version: "2.0",
        data: "Failed to register afterparty place"
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('search')
  async search() {
    try {
      const result = await this.afterpartyPlaceService.getTodayInfo();
      return {
        version: "2.0",
        data: result
      };
    } catch (error) {
      throw new HttpException({
        version: "2.0",
        data: "Failed to search afterparty places"
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
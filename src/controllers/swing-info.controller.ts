import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { SwingInfoService } from '../services/swing-info.service';
import { CreateSwingInfoDto, UpdateSwingInfoDto } from '../dto/swing-info.dto';

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

  @Put('updateInfo/:id')
  async updateInfo(
    @Param('id') id: number,
    @Body() updateSwingInfoDto: UpdateSwingInfoDto
  ) {
    try {
      const result = await this.swingInfoService.update(id, updateSwingInfoDto);
      if (!result) {
        throw new HttpException({
          version: "2.0",
          data: "Info not found"
        }, HttpStatus.NOT_FOUND);
      }
      return {
        version: "2.0",
        data: result
      };
    } catch (error) {
      throw new HttpException({
        version: "2.0",
        data: "Failed to update info"
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('getInfo')
  async getInfo() {
    try {
      const result = await this.swingInfoService.getNext7DaysInfo();
      return {
        version: "2.0",
        data: {
          schedule: result
        }
      };
    } catch (error) {
      throw new HttpException({
        version: "2.0",
        data: "Failed to get info"
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
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
          template: {
            outputs: [
              {
                simpleText: {
                  text: "generation 파라미터가 필요합니다."
                }
              }
            ]
          }
        }, HttpStatus.BAD_REQUEST);
      }

      const generation = getInfoDto.action.params.generation;
      console.log('Generation:', generation);
      
      const result = await this.swingInfoService.getInfoByGeneration(generation);
      console.log('Result:', result);

      // schedule 정보를 텍스트로 변환
      let text = '';
      const keys = Object.keys(result);
      if (keys.length === 0) {
        text = '해당 기수의 스케줄 정보가 없습니다.';
      } else {
        text = keys.map(date => {
          const info = result[date];
          if (!info) {
            const dayOfWeek = new Date(date).toLocaleDateString('ko-KR', { weekday: 'short' });
            return `${date} (${dayOfWeek}): 스케줄 없음`;
          }
          const dayOfWeek = new Date(date).toLocaleDateString('ko-KR', { weekday: 'short' });
          
          // 기본 정보
          let scheduleText = `${date} (${dayOfWeek}):\n장소: ${info.place}\nclub: ${info.club}`;
          
          // Optional 정보들 - 값이 있을 때만 추가
          if (info.teacher) {
            scheduleText += `\n강사: ${info.teacher}`;
          }
          if (info.dj) {
            scheduleText += `\nDJ: ${info.dj}`;
          }
          if (info.etc) {
            scheduleText += `\n기타: ${info.etc}`;
          }
          
          return scheduleText;
        }).join('\n\n');
      }

      return {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text
              }
            }
          ]
        }
      };
    } catch (error) {
      console.error('GetInfo error:', error);
      throw new HttpException({
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: "스케줄 정보를 불러오지 못했습니다."
              }
            }
          ]
        }
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
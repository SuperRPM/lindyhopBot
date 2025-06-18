import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AfterpartyPlace } from '../entities/afterparty-place.entity';
import { CreateAfterpartyPlaceDto, AfterpartyPlaceResponseDto } from '../dto/afterparty-place.dto';

@Injectable()
export class AfterpartyPlaceService {
  constructor(
    @InjectRepository(AfterpartyPlace)
    private afterpartyPlaceRepository: Repository<AfterpartyPlace>,
  ) {}

  async create(createAfterpartyPlaceDto: CreateAfterpartyPlaceDto): Promise<AfterpartyPlace> {
    const afterpartyPlace = this.afterpartyPlaceRepository.create(createAfterpartyPlaceDto);
    return await this.afterpartyPlaceRepository.save(afterpartyPlace);
  }

  async findByDate(date: Date): Promise<AfterpartyPlace> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.afterpartyPlaceRepository.findOne({
      where: {
        date: Between(startOfDay, endOfDay)
      }
    });
  }

  async getTodayInfo(): Promise<AfterpartyPlaceResponseDto> {
    const today = new Date();
    const todayInfo = await this.findByDate(today);

    if (!todayInfo) {
      return {
        jitterbug: '',
        'regular-first': '',
        'regular-second': '',
        'after-regular': '',
        nodata: '뒤풀이 정보가 없습니다'
      };
    }

    return {
      jitterbug: todayInfo.jitterbug,
      'regular-first': todayInfo.regularFirst,
      'regular-second': todayInfo.regularSecond,
      'after-regular': todayInfo.afterRegular
    };
  }
} 
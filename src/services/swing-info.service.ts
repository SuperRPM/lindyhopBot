import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SwingInfo } from '../entities/swing-info.entity';
import { CreateSwingInfoDto } from '../dto/swing-info.dto';

@Injectable()
export class SwingInfoService {
  constructor(
    @InjectRepository(SwingInfo)
    private swingInfoRepository: Repository<SwingInfo>,
  ) {}

  async create(createSwingInfoDto: CreateSwingInfoDto): Promise<SwingInfo> {
    const swingInfo = this.swingInfoRepository.create(createSwingInfoDto);
    return await this.swingInfoRepository.save(swingInfo);
  }

  async update(id: number, swingInfo: Partial<SwingInfo>): Promise<SwingInfo> {
    await this.swingInfoRepository.update(id, swingInfo);
    return this.swingInfoRepository.findOne({ where: { pk: id } });
  }

  async getNext7DaysInfo(): Promise<{ [key: string]: SwingInfo }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    const events = await this.swingInfoRepository.find({
      where: {
        startTime: Between(today, endDate)
      },
      order: {
        startTime: 'ASC'
      }
    });

    // 날짜별로 데이터 그룹화
    const result: { [key: string]: SwingInfo } = {};
    events.forEach((event, index) => {
      const dateKey = event.startTime.toISOString().split('T')[0];
      result[dateKey] = event;
    });

    // 빈 날짜 채우기
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      if (!result[dateKey]) {
        result[dateKey] = null;
      }
    }

    return result;
  }

  async getInfoByGeneration(generation: number): Promise<{ [key: string]: SwingInfo }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await this.swingInfoRepository.find({
      where: {
        generation: generation,
        startTime: Between(today, new Date('2099-12-31')) // 오늘부터 미래까지
      },
      order: {
        startTime: 'ASC'
      }
    });

    // 날짜별로 데이터 그룹화
    const result: { [key: string]: SwingInfo } = {};
    events.forEach((event) => {
      const dateKey = event.startTime.toISOString().split('T')[0];
      result[dateKey] = event;
    });

    return result;
  }

  async findAll(): Promise<SwingInfo[]> {
    return await this.swingInfoRepository.find({
      order: {
        startTime: 'ASC'  // 시작 시간 기준으로 오름차순 정렬
      }
    });
  }

  async findOne(id: number): Promise<SwingInfo> {
    return await this.swingInfoRepository.findOne({ where: { pk: id } });
  }
} 
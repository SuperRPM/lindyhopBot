import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassInfo } from '../entities/class-info.entity';
import { ClassListResponseDto, ClassInfoDto } from '../dto/settlement.dto';

@Injectable()
export class ClassInfoService {
  constructor(
    @InjectRepository(ClassInfo)
    private classInfoRepository: Repository<ClassInfo>,
  ) {}

  // 특정 generation의 클래스 목록 조회
  async getClassesByGeneration(generation: number): Promise<ClassListResponseDto> {
    try {
      const classes = await this.classInfoRepository.find({
        where: { generation },
        order: { id: 'ASC' }
      });

      const classDtos: ClassInfoDto[] = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        members: cls.members ? JSON.parse(cls.members) : []
      }));

      return {
        gen: generation,
        classes: classDtos
      };
    } catch (error) {
      console.error('클래스 목록 조회 오류:', error);
      throw new HttpException('클래스 목록 조회 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 클래스 정보 생성 (초기 데이터용)
  async createClassInfo(generation: number, name: string, members: string[]): Promise<ClassInfo> {
    try {
      const classInfo = this.classInfoRepository.create({
        generation,
        name,
        members: JSON.stringify(members)
      });

      return await this.classInfoRepository.save(classInfo);
    } catch (error) {
      console.error('클래스 정보 생성 오류:', error);
      throw new HttpException('클래스 정보 생성 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
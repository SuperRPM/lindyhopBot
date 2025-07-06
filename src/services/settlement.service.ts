import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settlement } from '../entities/settlement.entity';
import { SettlementSaveDto, SettlementLoadResponseDto, SettlementResultResponseDto, SettlementResultItemDto } from '../dto/settlement.dto';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Settlement)
    private settlementRepository: Repository<Settlement>,
  ) {}

  // 정산 저장 (생성 또는 수정)
  async saveSettlement(saveDto: SettlementSaveDto): Promise<{ id: string }> {
    try {
      let settlement: Settlement;

      if (saveDto.id) {
        // 수정
        settlement = await this.settlementRepository.findOne({ where: { id: saveDto.id } });
        if (!settlement) {
          throw new HttpException('정산 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
        }

        settlement = await this.settlementRepository.save({
          ...settlement,
          allMembers: JSON.stringify(saveDto.members.all),
          foodMembers: JSON.stringify(saveDto.members.food),
          alcoholMembers: JSON.stringify(saveDto.members.alcohol),
          beverageMembers: JSON.stringify(saveDto.members.beverage),
          foodTotal: saveDto.amount.food,
          alcoholTotal: saveDto.amount.alcohol,
          beverageTotal: saveDto.amount.beverage
        });
      } else {
        // 생성
        const newId = `s${saveDto.gen}${saveDto.class.toString().padStart(3, '0')}${Date.now().toString().slice(-3)}`;
        
        settlement = this.settlementRepository.create({
          id: newId,
          generation: saveDto.gen,
          classNumber: saveDto.class,
          allMembers: JSON.stringify(saveDto.members.all),
          foodMembers: JSON.stringify(saveDto.members.food),
          alcoholMembers: JSON.stringify(saveDto.members.alcohol),
          beverageMembers: JSON.stringify(saveDto.members.beverage),
          foodTotal: saveDto.amount.food,
          alcoholTotal: saveDto.amount.alcohol,
          beverageTotal: saveDto.amount.beverage
        });

        settlement = await this.settlementRepository.save(settlement);
      }

      return { id: settlement.id };
    } catch (error) {
      console.error('정산 저장 오류:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('정산 저장 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 정산 정보 로드
  async loadSettlement(id: string): Promise<SettlementLoadResponseDto> {
    try {
      const settlement = await this.settlementRepository.findOne({ where: { id } });
      
      if (!settlement) {
        throw new HttpException('정산 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      return {
        members: {
          all: settlement.allMembers ? JSON.parse(settlement.allMembers) : [],
          food: settlement.foodMembers ? JSON.parse(settlement.foodMembers) : [],
          alcohol: settlement.alcoholMembers ? JSON.parse(settlement.alcoholMembers) : [],
          beverage: settlement.beverageMembers ? JSON.parse(settlement.beverageMembers) : []
        },
        amount: {
          food: settlement.foodTotal,
          alcohol: settlement.alcoholTotal,
          beverage: settlement.beverageTotal
        },
        createdAt: settlement.createdAt,
        updatedAt: settlement.updatedAt
      };
    } catch (error) {
      console.error('정산 로드 오류:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('정산 로드 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 정산 결과 계산
  async getSettlementResult(id: string): Promise<SettlementResultResponseDto> {
    try {
      const settlement = await this.settlementRepository.findOne({ where: { id } });
      
      if (!settlement) {
        throw new HttpException('정산 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      const allMembers = settlement.allMembers ? JSON.parse(settlement.allMembers) : [];
      const foodMembers = settlement.foodMembers ? JSON.parse(settlement.foodMembers) : [];
      const alcoholMembers = settlement.alcoholMembers ? JSON.parse(settlement.alcoholMembers) : [];
      const beverageMembers = settlement.beverageMembers ? JSON.parse(settlement.beverageMembers) : [];

      const result: SettlementResultResponseDto = [];

      // 각 멤버별 계산
      allMembers.forEach(member => {
        const foodShare = foodMembers.includes(member) ? 
          Math.round(settlement.foodTotal / foodMembers.length) : 0;
        
        const alcoholShare = alcoholMembers.includes(member) ? 
          Math.round(settlement.alcoholTotal / alcoholMembers.length) : 0;
        
        const beverageShare = beverageMembers.includes(member) ? 
          Math.round(settlement.beverageTotal / beverageMembers.length) : 0;

        result.push({
          member,
          total: foodShare + alcoholShare + beverageShare,
          food: foodShare,
          alcohol: alcoholShare,
          beverage: beverageShare
        });
      });

      // 합계 추가
      result.push({
        member: '합계',
        total: settlement.foodTotal + settlement.alcoholTotal + settlement.beverageTotal,
        food: settlement.foodTotal,
        alcohol: settlement.alcoholTotal,
        beverage: settlement.beverageTotal
      });

      return result;
    } catch (error) {
      console.error('정산 결과 계산 오류:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('정산 결과 계산 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
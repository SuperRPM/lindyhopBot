import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../entities/vote.entity';
import { VoteDto } from '../dto/vote.dto';
import { Between } from 'typeorm';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  // 요일에 따른 투표 가능한 장소들 반환
  getAvailableVenues(dayOfWeek: number): string[] {
    switch (dayOfWeek) {
      case 1: // 월요일
        return ['bigApple'];
      case 2: // 화요일
        return ['경성홀'];
      case 3: // 수요일
        return ['time'];
      case 4: // 목요일
        return ['savoy'];
      case 5: // 금요일
        return ['happy', 'socialClub'];
      case 6: // 토요일
        return ['bigApple', '경성홀', 'time', 'savoy', 'happy', 'socialClub'];
      case 0: // 일요일
        return ['경성홀', 'time', 'happy'];
      default:
        return [];
    }
  }

  // 요일별 메시지 반환
  getDayMessage(dayOfWeek: number): string {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[dayOfWeek];
    
    switch (dayOfWeek) {
      case 1: // 월요일
        return `오늘은 ${dayName}요일! 어디로 갈까요?`;
      case 2: // 화요일
        return `오늘은 ${dayName}요일! 어디로 갈까요?`;
      case 3: // 수요일
        return `오늘은 ${dayName}요일! 어디로 갈까요?`;
      case 4: // 목요일
        return `오늘은 ${dayName}요일! 어디로 갈까요?`;
      case 5: // 금요일
        return `오늘은 ${dayName}요일! 어디로 갈까요?`;
      case 6: // 토요일
        return `오늘은 ${dayName}요일! 어디로 갈까요?`;
      case 0: // 일요일
        return `오늘은 ${dayName}요일! 어디로 갈까요?`;
      default:
        return '오늘은 투표할 수 없는 날입니다.';
    }
  }

  // 장소별 표시 이름 반환
  getVenueDisplayName(venue: string): string {
    const venueNames = {
      'bigApple': '빅애플',
      'kyungSung': '경성',
      'time': '타임',
      'savoy': '사보이',
      'happy': '해피',
      'socialClub': '쏘클'
    };
    return venueNames[venue] || venue;
  }

  // 사용자의 오늘 투표 확인
  async getUserTodayVote(userId: string, voteDate: Date): Promise<Vote | null> {
    const startOfDay = new Date(voteDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(voteDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.voteRepository.findOne({
      where: {
        userId,
        voteDate: Between(startOfDay, endOfDay)
      }
    });
  }

  // 투표 저장 (중복 투표 방지 및 투표 변경 처리)
  async saveVote(voteDto: VoteDto): Promise<{ vote: Vote; isVoteChange: boolean; previousVenue?: string }> {
    const startOfDay = new Date(voteDto.voteDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(voteDto.voteDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 기존 투표 확인
    const existingVote = await this.voteRepository.findOne({
      where: {
        userId: voteDto.userId,
        voteDate: Between(startOfDay, endOfDay)
      }
    });

    if (existingVote) {
      // 같은 장소에 투표하는 경우
      if (existingVote.venue === voteDto.venue) {
        throw new Error('ALREADY_VOTED_SAME_VENUE');
      }
      
      // 다른 장소에 투표하는 경우 - 기존 투표 삭제 후 새로 저장
      await this.voteRepository.delete(existingVote.id);
      const newVote = this.voteRepository.create(voteDto);
      const savedVote = await this.voteRepository.save(newVote);
      
      return {
        vote: savedVote,
        isVoteChange: true,
        previousVenue: existingVote.venue
      };
    } else {
      // 새로운 투표
      const vote = this.voteRepository.create(voteDto);
      const savedVote = await this.voteRepository.save(vote);
      
      return {
        vote: savedVote,
        isVoteChange: false
      };
    }
  }

  // 특정 날짜의 투표 통계
  async getVoteStats(voteDate: Date): Promise<Record<string, number>> {
    const startOfDay = new Date(voteDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(voteDate);
    endOfDay.setHours(23, 59, 59, 999);

    const votes = await this.voteRepository.find({
      where: { 
        voteDate: Between(startOfDay, endOfDay)
      }
    });

    const stats: Record<string, number> = {};
    votes.forEach(vote => {
      stats[vote.venue] = (stats[vote.venue] || 0) + 1;
    });

    return stats;
  }
} 
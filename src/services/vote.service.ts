import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../entities/vote.entity';
import { VoteDto } from '../dto/vote.dto';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  // 요일에 따른 투표 가능한 장소들 반환
  getAvailableVenues(dayOfWeek: number): string[] {
    switch (dayOfWeek) {
      case 5: // 금요일
        return ['happy', 'socialClub'];
      case 6: // 토요일
        return ['bigApple', 'kyungSung', 'time', 'savoy', 'happy', 'socialClub'];
      case 0: // 일요일
        return ['kyungSung', 'time', 'happy'];
      default:
        return [];
    }
  }

  // 요일별 메시지 반환
  getDayMessage(dayOfWeek: number): string {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[dayOfWeek];
    
    switch (dayOfWeek) {
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
    return this.voteRepository.findOne({
      where: {
        userId,
        voteDate
      }
    });
  }

  // 투표 저장 (기존 투표가 있으면 삭제 후 새로 저장)
  async saveVote(voteDto: VoteDto): Promise<Vote> {
    // 기존 투표 삭제
    await this.voteRepository.delete({
      userId: voteDto.userId,
      voteDate: voteDto.voteDate
    });

    // 새 투표 저장
    const vote = this.voteRepository.create(voteDto);
    return this.voteRepository.save(vote);
  }

  // 특정 날짜의 투표 통계
  async getVoteStats(voteDate: Date): Promise<Record<string, number>> {
    const votes = await this.voteRepository.find({
      where: { voteDate }
    });

    const stats: Record<string, number> = {};
    votes.forEach(vote => {
      stats[vote.venue] = (stats[vote.venue] || 0) + 1;
    });

    return stats;
  }
} 
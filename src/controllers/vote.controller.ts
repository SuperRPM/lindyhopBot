import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { VoteService } from '../services/vote.service';
import { KakaoChatRequestDto, VoteDto } from '../dto/vote.dto';

@Controller('api')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post('where-are-you-going')
  async whereAreYouGoing(@Body() request: KakaoChatRequestDto) {
    try {
      const userId = request.userRequest.user.id;
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0: 일요일, 5: 금요일, 6: 토요일
      
      // 투표 가능한 요일인지 확인
      const availableVenues = this.voteService.getAvailableVenues(dayOfWeek);
      if (availableVenues.length === 0) {
        return {
          version: "2.0",
          template: {
            outputs: [
              {
                simpleText: {
                  text: this.voteService.getDayMessage(dayOfWeek)
                }
              }
            ]
          }
        };
      }

      // 사용자의 오늘 투표 확인
      const userVote = await this.voteService.getUserTodayVote(userId, today);
      
      // 투표 통계 가져오기
      const voteStats = await this.voteService.getVoteStats(today);
      
      // 버튼 생성
      const buttons = availableVenues.map(venue => ({
        action: "block",
        label: `${this.voteService.getVenueDisplayName(venue)} (${voteStats[venue] || 0}명)`,
        blockId: `${venue}_vote_block_id`
      }));

      // 응답 메시지 구성
      let message = this.voteService.getDayMessage(dayOfWeek);
      if (userVote) {
        message += `\n\n현재 투표: ${this.voteService.getVenueDisplayName(userVote.venue)}`;
      }

      return {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: message
              }
            },
            {
              basicCard: {
                title: "오늘의 선택지",
                description: "투표하고 싶은 장소를 선택해주세요!",
                buttons: buttons
              }
            }
          ]
        }
      };

    } catch (error) {
      console.error('Vote error:', error);
      throw new HttpException({
        success: false,
        message: '투표 시스템 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('vote')
  async vote(@Body() request: KakaoChatRequestDto) {
    try {
      const userId = request.userRequest.user.id;
      const venue = request.userRequest.utterance; // 발화 내용에서 장소 추출
      const today = new Date();
      const dayOfWeek = today.getDay();

      // 투표 가능한 요일인지 확인
      const availableVenues = this.voteService.getAvailableVenues(dayOfWeek);
      if (availableVenues.length === 0) {
        return {
          version: "2.0",
          template: {
            outputs: [
              {
                simpleText: {
                  text: "오늘은 투표할 수 없는 날입니다."
                }
              }
            ]
          }
        };
      }

      // 유효한 장소인지 확인
      if (!availableVenues.includes(venue)) {
        return {
          version: "2.0",
          template: {
            outputs: [
              {
                simpleText: {
                  text: `오늘은 ${availableVenues.map(v => this.voteService.getVenueDisplayName(v)).join(', ')} 중에서 선택해주세요.`
                }
              }
            ]
          }
        };
      }

      // 투표 저장
      const voteDto: VoteDto = {
        userId,
        venue,
        voteDate: today
      };
      
      await this.voteService.saveVote(voteDto);

      // 업데이트된 투표 통계 가져오기
      const voteStats = await this.voteService.getVoteStats(today);

      return {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: `${this.voteService.getVenueDisplayName(venue)}에 투표했습니다!`
              }
            },
            {
              simpleText: {
                text: `현재 투표 현황:\n${availableVenues.map(v => `${this.voteService.getVenueDisplayName(v)}: ${voteStats[v] || 0}명`).join('\n')}`
              }
            }
          ]
        }
      };

    } catch (error) {
      console.error('Vote error:', error);
      throw new HttpException({
        success: false,
        message: '투표 처리 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
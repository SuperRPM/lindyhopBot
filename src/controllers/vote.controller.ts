import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { VoteService } from '../services/vote.service';
import { KakaoChatRequestDto, VoteDto } from '../dto/vote.dto';

@Controller('api')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Get('test-vote')
  async testVote() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const availableVenues = this.voteService.getAvailableVenues(dayOfWeek);
    
    return {
      success: true,
      data: {
        today: today.toISOString(),
        dayOfWeek,
        dayName: ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek],
        availableVenues,
        message: this.voteService.getDayMessage(dayOfWeek)
      }
    };
  }

  @Post('where-are-you-going')
  async whereAreYouGoing(@Body() request: any) {
    try {
      console.log('Received request:', JSON.stringify(request, null, 2));
      
      // 요청 구조 검증
      if (!request || !request.userRequest || !request.userRequest.user) {
        console.error('Invalid request structure:', request);
        throw new HttpException({
          success: false,
          message: '잘못된 요청 구조입니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      const userId = request.userRequest.user.id;
      if (!userId) {
        console.error('User ID is missing');
        throw new HttpException({
          success: false,
          message: '사용자 ID가 없습니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      const today = new Date();
      const dayOfWeek = today.getDay(); // 0: 일요일, 5: 금요일, 6: 토요일
      
      console.log(`Processing vote for user ${userId} on day ${dayOfWeek}`);
      
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
      
      // 버튼 생성 (투표 통계 없이)
      const buttons = availableVenues.map(venue => {
        // 실제 BlockId 매핑 (각 블록의 실제 ID로 변경 필요)
        const blockIdMap = {
          'happy': '685ce50a3b4d4e7155a611ea', // 해피 투표 블록 ID
          'savoy': '685ce47e5cbd9f3517572f60',      // 사보이 투표 블록 ID
          'socialClub': '685ce525189c9d49a1ca4f60', // 쏘클 투표 블록 ID
          'bigApple': '685ce461d8701133602627b0',     // 빅애플 투표 블록 ID
          'kyungSung': '685ce46a7aba261f9b020221',   // 경성 투표 블록 ID
          'time': '685ce47412ebc22ec8df41fb'              // 타임 투표 블록 ID
        };

        return {
          action: "block",
          label: this.voteService.getVenueDisplayName(venue),
          blockId: blockIdMap[venue] || `${venue}_vote_block`
        };
      });

      // 응답 메시지 구성
      let message = this.voteService.getDayMessage(dayOfWeek);
      if (userVote) {
        message += `\n\n현재 투표: ${this.voteService.getVenueDisplayName(userVote.venue)}`;
      }

      const response = {
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
                title: "오늘은 어디로갈까?",
                description: "출빠할 장소를 선택해주세요!",
                buttons: buttons
              }
            }
          ]
        }
      };

      console.log('Sending response:', JSON.stringify(response, null, 2));
      return response;

    } catch (error) {
      console.error('Vote error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        success: false,
        message: '투표 시스템 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('vote')
  async vote(@Body() request: any) {
    try {
      console.log('Received vote request:', JSON.stringify(request, null, 2));
      
      // 요청 구조 검증
      if (!request || !request.userRequest || !request.userRequest.user) {
        console.error('Invalid vote request structure:', request);
        throw new HttpException({
          success: false,
          message: '잘못된 요청 구조입니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      const userId = request.userRequest.user.id;
      const venue = request.userRequest.utterance; // 발화 내용에서 장소 추출
      const today = new Date();
      const dayOfWeek = today.getDay();

      console.log(`Processing vote: user=${userId}, venue=${venue}, day=${dayOfWeek}`);

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

      const response = {
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

      console.log('Sending vote response:', JSON.stringify(response, null, 2));
      return response;

    } catch (error) {
      console.error('Vote error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        success: false,
        message: '투표 처리 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('vote-action')
  async voteAction(@Body() request: any) {
    try {
      console.log('Received vote action request:', JSON.stringify(request, null, 2));
      
      // 요청 구조 검증
      if (!request || !request.userRequest || !request.userRequest.user) {
        console.error('Invalid vote action request structure:', request);
        throw new HttpException({
          success: false,
          message: '잘못된 요청 구조입니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      const userId = request.userRequest.user.id;
      const today = new Date();
      const dayOfWeek = today.getDay();

      // 액션 파라미터에서 장소 추출
      let venue = '';
      if (request.action && request.action.params) {
        venue = request.action.params.venue;
      } else if (request.userRequest.params) {
        venue = request.userRequest.params.venue;
      }

      // 장소가 없으면 utterance에서 추출 시도
      if (!venue && request.userRequest.utterance) {
        venue = request.userRequest.utterance;
      }

      console.log(`Processing vote action: user=${userId}, venue=${venue}, day=${dayOfWeek}`);

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

      const response = {
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

      console.log('Sending vote action response:', JSON.stringify(response, null, 2));
      return response;

    } catch (error) {
      console.error('Vote action error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        success: false,
        message: '투표 처리 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 각 장소별 투표 엔드포인트
  @Post('vote-happy')
  async voteHappy(@Body() request: any) {
    return this.processVote(request, 'happy');
  }

  @Post('vote-savoy')
  async voteSavoy(@Body() request: any) {
    return this.processVote(request, 'savoy');
  }

  @Post('vote-socialClub')
  async voteSocialClub(@Body() request: any) {
    return this.processVote(request, 'socialClub');
  }

  @Post('vote-bigApple')
  async voteBigApple(@Body() request: any) {
    return this.processVote(request, 'bigApple');
  }

  @Post('vote-kyungSung')
  async voteKyungSung(@Body() request: any) {
    return this.processVote(request, 'kyungSung');
  }

  @Post('vote-time')
  async voteTime(@Body() request: any) {
    return this.processVote(request, 'time');
  }

  // 공통 투표 처리 메서드
  private async processVote(request: any, venue: string) {
    try {
      console.log(`Received vote request for ${venue}:`, JSON.stringify(request, null, 2));
      
      // 요청 구조 검증
      if (!request || !request.userRequest || !request.userRequest.user) {
        console.error('Invalid vote request structure:', request);
        throw new HttpException({
          success: false,
          message: '잘못된 요청 구조입니다.'
        }, HttpStatus.BAD_REQUEST);
      }

      const userId = request.userRequest.user.id;
      const today = new Date();
      const dayOfWeek = today.getDay();

      console.log(`Processing vote: user=${userId}, venue=${venue}, day=${dayOfWeek}`);

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

      const response = {
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

      console.log(`Sending vote response for ${venue}:`, JSON.stringify(response, null, 2));
      return response;

    } catch (error) {
      console.error(`Vote error for ${venue}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        success: false,
        message: '투표 처리 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
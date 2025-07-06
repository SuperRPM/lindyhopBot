import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ReceiptItemDto, ReceiptAnalysisResponseDto } from '../dto/receipt.dto';
import { ReceiptImageService } from './receipt-image.service';

@Injectable()
export class AiReceiptService {
  private readonly openaiApiKey = process.env.OPENAI_API_KEY;
  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly visionApiKey = process.env.CLOUD_VISION_API_KEY;

  constructor(private readonly receiptImageService: ReceiptImageService) {
    console.log('Google Cloud Vision API Key 설정 확인 중...');
    console.log('CLOUD_VISION_API_KEY 존재 여부:', !!this.visionApiKey);
    
    if (!this.visionApiKey) {
      console.warn('⚠️ CLOUD_VISION_API_KEY가 설정되지 않았습니다.');
    } else {
      console.log('✅ Vision API Key 설정 완료');
    }
  }

  async analyzeReceipt(
    imageBase64: string, 
    originalName: string = 'receipt.jpg',
    mimeType: string = 'image/jpeg',
    settlementId?: string,
    generation?: number,
    classNumber?: number
  ): Promise<ReceiptAnalysisResponseDto> {
    try {
      if (!this.openaiApiKey) {
        throw new HttpException('OpenAI API 키가 설정되지 않았습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (!this.visionApiKey) {
        throw new HttpException('Google Cloud Vision API 키가 설정되지 않았습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 1단계: Google Cloud Vision API로 텍스트 추출
      console.log('1단계: Google Cloud Vision API로 텍스트 추출 중...');
      const extractedText = await this.extractTextWithVisionAPI(imageBase64);
      
      if (!extractedText) {
        throw new HttpException('텍스트 추출에 실패했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      console.log('추출된 텍스트:', extractedText);

      // 2단계: GPT로 메뉴 분류
      console.log('2단계: GPT로 메뉴 분류 중...');
      const response = await this.classifyMenuWithGPT(extractedText);
      
      // 응답 파싱
      const parsedData = this.parseAIResponse(response);
      
      // 3단계: 영수증 이미지 저장
      console.log('3단계: 영수증 이미지 저장 중...');
      await this.receiptImageService.saveReceiptImage(
        imageBase64,
        originalName,
        mimeType,
        parsedData,
        settlementId,
        generation,
        classNumber
      );
      
      return {
        success: true,
        data: parsedData
      };

    } catch (error) {
      console.error('Receipt analysis error:', error);
      throw new HttpException(
        '영수증 분석 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Google Cloud Vision API로 텍스트 추출 (API Key 방식)
  private async extractTextWithVisionAPI(imageBase64: string): Promise<string> {
    try {
      const request = {
        requests: [
          {
            image: {
              content: imageBase64
            },
            features: [
              {
                type: 'TEXT_DETECTION'
              }
            ]
          }
        ]
      };

      const url = `https://vision.googleapis.com/v1/images:annotate?key=${this.visionApiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Vision API 응답 오류:', response.status, errorData);
        throw new Error(`Vision API 오류: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const textAnnotations = data.responses[0]?.textAnnotations;

      if (!textAnnotations || textAnnotations.length === 0) {
        console.log('텍스트를 찾을 수 없습니다.');
        return '';
      }

      // 첫 번째 요소는 전체 텍스트
      const fullText = textAnnotations[0].description || '';
      console.log('Vision API 텍스트 추출 완료');
      
      return fullText;

    } catch (error) {
      console.error('Vision API 오류:', error);
      throw new Error('텍스트 추출 중 오류가 발생했습니다.');
    }
  }

  // GPT로 메뉴 분류
  private async classifyMenuWithGPT(extractedText: string): Promise<string> {
    const prompt = `
다음은 Google Cloud Vision API로 추출한 영수증 텍스트입니다. 각 메뉴 항목을 정확히 분류해주세요.

**추출된 텍스트:**
${extractedText}

**중요한 규칙 (반드시 지킬 것):**
1. 메뉴명과 가격은 반드시 같은 "가로 줄(수평 라인)"에서만 매칭하세요.
2. 위/아래 줄에 있는 가격이나 메뉴명과 섞이지 않게 하세요.
3. 수량 정보는 무시하고 메뉴명과 가격만 추출하세요.
4. 존재하지 않는 메뉴는 절대 추가하지 마세요.
5. 메뉴명과 가격은 원본 텍스트의 순서를 그대로 따르세요.
6. 가격은 오른쪽에 있는 값을 사용하세요. (한 줄의 맨 오른쪽 값이 금액임)
7. "과세금액", "부가세", "주문합계" 같은 합계 부분은 절대 항목에 포함하지 마세요.

**카테고리 분류 기준:**
- 안주: 음식 메뉴 (밥, 면, 고기, 해산물, 볶음요리 등)
- 주류: 술 종류 (맥주, 소주, 와인, 위스키, 막걸리 등)
- 음료: 음료 종류 (콜라, 사이다, 커피, 주스, 차 등)

**응답 형식 (JSON만 출력하세요):**
{
  "totalAmount": 총 금액,
  "categories": {
    "안주": {
      "items": [{"name": "정확한메뉴명", "price": 정확한가격}],
      "total": 안주 총액
    },
    "주류": {
      "items": [{"name": "정확한메뉴명", "price": 정확한가격}],
      "total": 주류 총액
    },
    "음료": {
      "items": [{"name": "정확한메뉴명", "price": 정확한가격}],
      "total": 음료 총액
    }
  }
}

**특별 주의:**
- 가격 밀림 절대 금지. 반드시 같은 줄에서만 매칭하세요.
- 합계 항목(과세금액, 주문합계 등)은 절대 포함하지 마세요.
`;

    try {
      const response = await fetch(this.openaiApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API 응답 오류:', response.status, errorData);
        throw new Error(`OpenAI API 오류: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI API에서 응답 내용을 받지 못했습니다.');
      }

      console.log('GPT 응답:', content);
      return content;

    } catch (error) {
      console.error('OpenAI API 오류:', error);
      throw new Error('메뉴 분류 중 오류가 발생했습니다.');
    }
  }

  // AI 응답 파싱
  private parseAIResponse(response: string): any {
    try {
      // JSON 부분만 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      // 기본 구조 확인 및 초기화
      if (!parsedData.categories) {
        parsedData.categories = {};
      }

      // 각 카테고리 초기화
      ['안주', '주류', '음료'].forEach(category => {
        if (!parsedData.categories[category]) {
          parsedData.categories[category] = { items: [], total: 0 };
        }
        if (!Array.isArray(parsedData.categories[category].items)) {
          parsedData.categories[category].items = [];
        }
      });

      // totalAmount가 없으면 계산
      if (!parsedData.totalAmount) {
        parsedData.totalAmount = Object.values(parsedData.categories).reduce(
          (sum: number, category: any) => sum + (category.total || 0), 0
        );
      }

      return parsedData;

    } catch (error) {
      console.error('AI 응답 파싱 오류:', error);
      console.error('원본 응답:', response);
      
      // 기본 구조 반환
      return {
        totalAmount: 0,
        categories: {
          안주: { items: [], total: 0 },
          주류: { items: [], total: 0 },
          음료: { items: [], total: 0 }
        }
      };
    }
  }
} 
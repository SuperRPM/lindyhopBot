# LindyHop Bot API Server

NestJS 기반의 스윙댄스 정보 및 투표 시스템 API 서버입니다.

## 기능

- 스윙댄스 정보 CRUD
- 어드민 페이지 (JWT 인증)
- 카카오 챗봇 투표 시스템
- 영수증 AI 분석 (안주/주류/음료 분류)
- 정산 시스템 (멤버별 금액 계산)

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# JWT Secret
JWT_SECRET=your-secret-key-here

# OpenAI API Key (영수증 분석용)
OPENAI_API_KEY=your-openai-api-key-here

# Google Cloud Vision API Key (영수증 텍스트 추출용)
CLOUD_VISION_API_KEY=your-google-cloud-vision-api-key-here

# Database
DATABASE_URL=swing.db

# Server
PORT=3000
NODE_ENV=development
```

## 설치 및 실행

```bash
npm install
npm run start:dev
```

## API 엔드포인트

### 정산 시스템 API

#### 클래스 선택 초기값 불러오기
**GET** `/api/class?gen=134`

응답 예시:
```json
{
  "gen": 134,
  "classes": [
    {
      "id": 1,
      "name": "지터벅",
      "members": ["김철수", "이영희", "모든사람", "이름"]
    },
    {
      "id": 2,
      "name": "입문",
      "members": ["누구", "두구", "루구"]
    }
  ]
}
```

#### 정산 결과 저장하기 (생성/수정 겸용)
**POST** `/api/settlement/save`

요청 예시:
```json
{
  "gen": 134,
  "class": 1,
  "id": "s1341001",
  "members": {
    "all": ["김철수", "이영희", "모든사람"],
    "food": ["김철수", "이영희"],
    "alcohol": ["김철수"],
    "beverage": []
  },
  "amount": {
    "food": 50000,
    "alcohol": 15000,
    "beverage": 0
  }
}
```

응답 예시:
```json
{
  "id": "s1341001"
}
```

#### 정산 결과 불러오기
**GET** `/api/settlement/load?id=s1341001`

응답 예시:
```json
{
  "members": {
    "all": ["김철수", "이영희", "모든사람"],
    "food": ["김철수", "이영희"],
    "alcohol": ["김철수"],
    "beverage": []
  },
  "amount": {
    "food": 50000,
    "alcohol": 15000,
    "beverage": 0
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 최종 정산 결과 계산하기
**GET** `/api/settlement/result?id=s1341001`

응답 예시:
```json
[
  {
    "member": "김철수",
    "total": 40000,
    "food": 25000,
    "alcohol": 15000,
    "beverage": 0
  },
  {
    "member": "이영희",
    "total": 25000,
    "food": 25000,
    "alcohol": 0,
    "beverage": 0
  },
  {
    "member": "모든사람",
    "total": 0,
    "food": 0,
    "alcohol": 0,
    "beverage": 0
  },
  {
    "member": "합계",
    "total": 65000,
    "food": 50000,
    "alcohol": 15000,
    "beverage": 0
  }
]
```

### 영수증 분석 API

**POST** `/api/analyze-receipt`
- 식당 영수증 사진을 AI로 분석하여 안주, 주류, 음료로 분류
- JWT 인증 필요

요청 예시:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

응답 예시:
```json
{
  "success": true,
  "data": {
    "totalAmount": 45000,
    "categories": {
      "안주": {
        "items": [
          {"name": "삼겹살", "price": 15000},
          {"name": "김치찌개", "price": 8000}
        ],
        "total": 23000
      },
      "주류": {
        "items": [
          {"name": "맥주", "price": 5000},
          {"name": "소주", "price": 4000}
        ],
        "total": 9000
      },
      "음료": {
        "items": [
          {"name": "콜라", "price": 2000},
          {"name": "사이다", "price": 2000}
        ],
        "total": 4000
      }
    }
  }
}
```

### 테스트 API

**POST** `/api/test-receipt`
- 영수증 분석 API 연결 테스트 (인증 불필요)

## OpenAI API 설정

1. [OpenAI](https://platform.openai.com/)에서 API 키를 발급받으세요
2. `.env` 파일에 `OPENAI_API_KEY`를 설정하세요
3. GPT-4o 모델을 사용하여 이미지 분석을 수행합니다

## Google Cloud Vision API 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 API 키를 발급받으세요
2. Cloud Vision API를 활성화하세요
3. `.env` 파일에 `CLOUD_VISION_API_KEY`를 설정하세요

## 주의사항

- 영수증 분석 API는 JWT 인증이 필요합니다
- 이미지는 base64 형식으로 전송해야 합니다
- OpenAI API 사용량에 따라 비용이 발생할 수 있습니다
- Google Cloud Vision API 사용량에 따라 비용이 발생할 수 있습니다
- 정산 시스템 API는 인증이 필요하지 않습니다

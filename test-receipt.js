const fs = require('fs');
const path = require('path');

// 이미지 파일을 base64로 변환하는 함수
function imageToBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64String = imageBuffer.toString('base64');
    return base64String;
  } catch (error) {
    console.error('이미지 파일 읽기 오류:', error);
    return null;
  }
}

// API에 영수증 분석 요청을 보내는 함수
async function analyzeReceipt(imageBase64) {
  try {
    const requestBody = {
      imageBase64: `data:image/jpeg;base64,${imageBase64}`
    };
    
    console.log('요청 데이터 크기:', JSON.stringify(requestBody).length);
    console.log('요청 데이터 샘플:', JSON.stringify(requestBody).substring(0, 100) + '...');
    
    const response = await fetch('http://localhost:3000/api/analyze-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 오류:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return null;
  }
}

// 테스트 API 호출 (인증 불필요)
async function testReceiptAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/test-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('테스트 API 오류:', response.status);
      return;
    }

    const result = await response.json();
    console.log('테스트 API 응답:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('테스트 API 요청 오류:', error);
  }
}

// 메인 실행 함수
async function main() {
  const imagePath = '/Users/isang-yong/Downloads/영수증2.jpg';
  
  // 파일 존재 확인
  if (!fs.existsSync(imagePath)) {
    console.error('이미지 파일을 찾을 수 없습니다:', imagePath);
    return;
  }

  console.log('이미지 파일을 base64로 변환 중...');
  const base64Image = imageToBase64(imagePath);
  
  if (!base64Image) {
    console.error('이미지 변환에 실패했습니다.');
    return;
  }

  console.log('이미지 변환 완료. 크기:', base64Image.length, '문자');

  // 먼저 테스트 API 호출
  console.log('\n=== 테스트 API 호출 ===');
  await testReceiptAPI();

  // 실제 분석 API 호출
  console.log('\n=== 영수증 분석 API 호출 ===');
  const result = await analyzeReceipt(base64Image);
  if (result) {
    console.log('분석 결과:', JSON.stringify(result, null, 2));
  }
}

// 스크립트 실행
main().catch(console.error); 
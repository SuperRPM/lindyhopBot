const fs = require('fs');

// 이미지 파일을 base64로 변환
function imageToBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('이미지 파일 읽기 오류:', error);
    return null;
  }
}

// 영수증 분석 API 호출
async function analyzeReceipt() {
  const imagePath = '/Users/isang-yong/Downloads/영수증2.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.error('이미지 파일을 찾을 수 없습니다:', imagePath);
    return;
  }

  console.log('이미지 변환 중...');
  const base64Image = imageToBase64(imagePath);
  
  if (!base64Image) {
    console.error('이미지 변환 실패');
    return;
  }

  console.log('이미지 크기:', base64Image.length, '문자');
  console.log('API 호출 중...');

  try {
    const response = await fetch('http://localhost:3000/api/analyze-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64: `data:image/jpeg;base64,${base64Image}`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 오류:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('분석 결과:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('요청 오류:', error);
  }
}

analyzeReceipt(); 
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

// 파일 크기를 MB 단위로 변환
function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// 이미지를 2MB 이하가 될 때까지 압축
async function compressImageToTargetSize(inputPath, targetSizeMB = 2) {
  const originalSize = getFileSizeInMB(inputPath);
  console.log(`원본 이미지 크기: ${originalSize}MB`);
  
  if (originalSize <= targetSizeMB) {
    console.log('이미 목표 크기 이하입니다. 압축이 필요하지 않습니다.');
    return inputPath;
  }

  const inputDir = path.dirname(inputPath);
  const inputName = path.basename(inputPath, path.extname(inputPath));
  const inputExt = path.extname(inputPath);
  
  let quality = 100;
  let attempt = 1;
  let outputPath;
  
  while (quality > 10) { // 최소 품질 10%까지
    outputPath = path.join(inputDir, `${inputName}_compressed_${attempt}${inputExt}`);
    
    console.log(`\n압축 시도 ${attempt}: 품질 ${quality}%`);
    
    try {
      await sharp(inputPath)
        .jpeg({ quality: quality })
        .toFile(outputPath);
      
      const compressedSize = getFileSizeInMB(outputPath);
      console.log(`압축 후 크기: ${compressedSize}MB`);
      
      if (compressedSize <= targetSizeMB) {
        console.log(`✅ 목표 크기(${targetSizeMB}MB) 이하로 압축 완료!`);
        console.log(`압축된 파일: ${outputPath}`);
        return outputPath;
      }
      
      // 이전 압축 파일 삭제
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
      // 품질을 30% 감소
      quality = Math.max(10, quality - 30);
      attempt++;
      
    } catch (error) {
      console.error('압축 중 오류:', error);
      break;
    }
  }
  
  console.log('❌ 목표 크기로 압축할 수 없습니다. 최소 품질에 도달했습니다.');
  return null;
}

// 이미지를 base64로 변환
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

// 메인 실행 함수
async function main() {
  const inputPath = '/Users/isang-yong/Downloads/영수증2.jpg';
  
  // 파일 존재 확인
  if (!fs.existsSync(inputPath)) {
    console.error('이미지 파일을 찾을 수 없습니다:', inputPath);
    return;
  }
  
  console.log('=== 이미지 압축 시작 ===');
  
  // 이미지 압축
  const compressedPath = await compressImageToTargetSize(inputPath, 2);
  
  if (!compressedPath) {
    console.error('압축에 실패했습니다.');
    return;
  }
  
  console.log('\n=== base64 변환 ===');
  
  // 압축된 이미지를 base64로 변환
  const base64Image = imageToBase64(compressedPath);
  
  if (!base64Image) {
    console.error('base64 변환에 실패했습니다.');
    return;
  }
  
  console.log(`base64 크기: ${base64Image.length} 문자`);
  console.log(`base64 크기 (MB): ${(base64Image.length * 0.75 / (1024 * 1024)).toFixed(2)}MB`);
  
  // 압축된 파일 정보
  const compressedSize = getFileSizeInMB(compressedPath);
  console.log(`\n최종 압축된 파일 크기: ${compressedSize}MB`);
  console.log(`압축된 파일 경로: ${compressedPath}`);
  
  // API 테스트를 위한 정보
  console.log('\n=== API 테스트용 정보 ===');
  console.log('test-receipt.js에서 다음 경로로 변경하세요:');
  console.log(`const imagePath = '${compressedPath}';`);
}

// 스크립트 실행
main().catch(console.error); 
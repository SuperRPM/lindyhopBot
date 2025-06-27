// JWT 토큰을 얻기 위한 로그인 스크립트
async function getJWTToken() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('로그인 오류:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    console.log('로그인 성공!');
    console.log('JWT 토큰:', result.access_token);
    return result.access_token;
  } catch (error) {
    console.error('로그인 요청 오류:', error);
    return null;
  }
}

// 스크립트 실행
getJWTToken().catch(console.error); 
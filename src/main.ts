import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AuthService } from './services/auth.service';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  // 시간대를 KST로 설정
  process.env.TZ = 'Asia/Seoul';
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  
  // CORS 설정 추가
  app.enableCors({
    origin: [
      'https://nbreadfortest.glitch.me',
      'https://nbread.glitch.me',
      // 카카오 챗봇 관련 도메인
      'https://kakao.com',
      'https://www.kakao.com',
      'https://developers.kakao.com',
      'https://chatbot.kakao.com',
      'https://kakaoi.talk.kakao.com',
      'https://kakaoi.talk.kakao.com:443',
      'https://kakaoi.talk.kakao.com:80',
      'https://kakaoi.talk.kakao.com:3000',
      'https://kakaoi.talk.kakao.com:8080',
      // 카카오톡 앱에서 오는 요청 (User-Agent 기반)
      'https://kakao.com',
      'https://*.kakao.com',
      'https://*.kakaoi.talk.kakao.com',
      // 개발용 localhost
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080',
      'https://localhost:3000',
      'https://localhost:3001',
      'https://127.0.0.1:3000',
      'https://127.0.0.1:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'User-Agent'],
    credentials: true,
  });
  
  // 요청 크기 제한 늘리기 (50MB)
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '50mb' }));
  
  // 모든 요청 로깅
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    next();
  });

  // ValidationPipe 설정 완화
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // false로 변경
    transform: true,
    disableErrorMessages: false, // 에러 메시지 활성화
  }));

  // 정적 파일 서빙 설정
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 초기 관리자 계정 생성
  const authService = app.get(AuthService);
  await authService.createInitialAdmin();

  const port = process.env.PORT || 3000;
  const useHttps = process.env.USE_HTTPS === 'true';

  if (useHttps) {
    try {
      // HTTPS 설정
      const httpsOptions = {
        key: fs.readFileSync('./ssl/private.key'),
        cert: fs.readFileSync('./ssl/certificate.crt'),
      };

      // HTTPS 서버 생성
      const httpsServer = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());
      
      await app.init();
      
      httpsServer.listen(port, () => {
        console.log(`HTTPS Server is running on https://localhost:${port}`);
        console.log(`Admin page: https://localhost:${port}/admin.html`);
        console.log('Current timezone:', process.env.TZ);
        console.log('Current time:', new Date().toISOString());
        console.log('CORS enabled for:', [
          'https://nbreadfortest.glitch.me',
          'https://nbread.glitch.me',
          'localhost domains'
        ]);
      });
    } catch (error) {
      console.error('SSL 인증서 파일을 찾을 수 없습니다. HTTP로 실행합니다.');
      console.error('SSL 인증서를 생성하려면: openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/certificate.crt -days 365 -nodes');
      
      await app.listen(port);
      console.log(`HTTP Server is running on http://localhost:${port}`);
      console.log(`Admin page: http://localhost:${port}/admin.html`);
      console.log('Current timezone:', process.env.TZ);
      console.log('Current time:', new Date().toISOString());
      console.log('CORS enabled for:', [
        'https://nbreadfortest.glitch.me',
        'https://nbread.glitch.me',
        'localhost domains'
      ]);
    }
  } else {
    await app.listen(port);
    console.log(`HTTP Server is running on http://localhost:${port}`);
    console.log(`Admin page: http://localhost:${port}/admin.html`);
    console.log('Current timezone:', process.env.TZ);
    console.log('Current time:', new Date().toISOString());
    console.log('CORS enabled for:', [
      'https://nbreadfortest.glitch.me',
      'https://nbread.glitch.me',
      'localhost domains'
    ]);
  }
}
bootstrap(); 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  
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

  await app.listen(3000);
  console.log('Server is running on http://localhost:3000');
}
bootstrap(); 
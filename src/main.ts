import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express'; // expressからjsonとurlencodedをインポート

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ペイロードサイズ制限を設定 (例: 50mb)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // CORSの設定
  // 環境変数からフロントエンドのURLを取得し、環境に応じてフォールバック値を設定
  let frontendUrl = process.env.FRONTEND_URL;
  
  // 本番環境の場合、または環境変数が設定されていない場合は本番URLを使用
  if (process.env.NODE_ENV === 'production' || !frontendUrl) {
    frontendUrl = 'https://lynx-frontend.onrender.com';
  }
  
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

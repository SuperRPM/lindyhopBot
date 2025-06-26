import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SwingInfoController } from './controllers/swing-info.controller';
import { SwingInfoService } from './services/swing-info.service';
import { SwingInfo } from './entities/swing-info.entity';
import { AfterpartyPlaceController } from './controllers/afterparty-place.controller';
import { AfterpartyPlaceService } from './services/afterparty-place.service';
import { AfterpartyPlace } from './entities/afterparty-place.entity';
import { AdminController } from './controllers/admin.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from './entities/user.entity';
import { UploadController } from './controllers/upload.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'swing.db',
      entities: [SwingInfo, AfterpartyPlace, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([SwingInfo, AfterpartyPlace, User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [SwingInfoController, AfterpartyPlaceController, AdminController, AuthController, UploadController],
  providers: [SwingInfoService, AfterpartyPlaceService, AuthService, JwtStrategy],
})
export class AppModule {} 
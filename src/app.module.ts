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
import { VoteController } from './controllers/vote.controller';
import { VoteService } from './services/vote.service';
import { Vote } from './entities/vote.entity';
import { ReceiptController } from './controllers/receipt.controller';
import { AiReceiptService } from './services/ai-receipt.service';
import { SettlementController } from './controllers/settlement.controller';
import { SettlementService } from './services/settlement.service';
import { Settlement } from './entities/settlement.entity';
import { ClassInfoService } from './services/class-info.service';
import { ClassInfo } from './entities/class-info.entity';
import { ReceiptImageService } from './services/receipt-image.service';
import { ReceiptImage } from './entities/receipt-image.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'swing.db',
      entities: [SwingInfo, AfterpartyPlace, User, Vote, Settlement, ClassInfo, ReceiptImage],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([SwingInfo, AfterpartyPlace, User, Vote, Settlement, ClassInfo, ReceiptImage]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [SwingInfoController, AfterpartyPlaceController, AdminController, AuthController, UploadController, VoteController, ReceiptController, SettlementController],
  providers: [SwingInfoService, AfterpartyPlaceService, AuthService, JwtStrategy, VoteService, AiReceiptService, SettlementService, ClassInfoService, ReceiptImageService],
})
export class AppModule {} 
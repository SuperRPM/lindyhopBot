import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwingInfoController } from './controllers/swing-info.controller';
import { SwingInfoService } from './services/swing-info.service';
import { SwingInfo } from './entities/swing-info.entity';
import { AfterpartyPlaceController } from './controllers/afterparty-place.controller';
import { AfterpartyPlaceService } from './services/afterparty-place.service';
import { AfterpartyPlace } from './entities/afterparty-place.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'swing.db',
      entities: [SwingInfo, AfterpartyPlace],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([SwingInfo, AfterpartyPlace]),
  ],
  controllers: [SwingInfoController, AfterpartyPlaceController],
  providers: [SwingInfoService, AfterpartyPlaceService],
})
export class AppModule {} 
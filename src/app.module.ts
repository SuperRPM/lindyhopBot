import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwingInfoController } from './controllers/swing-info.controller';
import { SwingInfoService } from './services/swing-info.service';
import { SwingInfo } from './entities/swing-info.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'swing.db',
      entities: [SwingInfo],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([SwingInfo]),
  ],
  controllers: [SwingInfoController],
  providers: [SwingInfoService],
})
export class AppModule {} 
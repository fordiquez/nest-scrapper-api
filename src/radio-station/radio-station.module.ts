import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadioStationController } from './radio-station.controller';
import { RadioStationService } from './radio-station.service';
import { RadioStation } from './radio-station.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RadioStation])],
  providers: [RadioStationService],
  controllers: [RadioStationController],
})
export class RadioStationModule {}

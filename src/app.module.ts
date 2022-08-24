import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadioStationModule } from './radio-station/radio-station.module';
import { ConfigModule } from '@nestjs/config';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    RadioStationModule,
    ImageModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrapeController } from './scrape.controller';
import { ScrapeService } from './scrape.service';
import { Scrape } from "./scrape.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Scrape])],
  providers: [ScrapeService],
  controllers: [ScrapeController],
})
export class ScrapeModule {}

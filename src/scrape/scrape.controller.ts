import { Body, Controller, Post } from '@nestjs/common';
import { ScrapeService } from './scrape.service';

@Controller('scrape')
export class ScrapeController {
  constructor(private readonly scrapeService: ScrapeService) {}

  @Post()
  async create(@Body('country') country: string): Promise<void> {
    return await this.scrapeService.create(country);
  }
}

import { Body, Controller, Post } from "@nestjs/common";
import { AppService } from './app.service';

@Controller('scrape')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('')
  async getData(@Body('country') country: string): Promise<void> {
    return await this.appService.getData(country);
  }
}

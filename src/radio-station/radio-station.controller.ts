import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { RadioStationService } from './radio-station.service';
import { RadioStation } from "./radio-station.entity";

@Controller('radio-station')
export class RadioStationController {
  constructor(private readonly radioStationService: RadioStationService) {}

  @Post()
  async create(@Body('country') country: string): Promise<void> {
    return await this.radioStationService.create(country);
  }

  @Get(':radioId')
  async getByRadioId(@Param('radioId', ParseIntPipe) radioId: number): Promise<RadioStation> {
    return this.radioStationService.getByRadioId(radioId);
  }

  @Get()
  async getByTags(@Query('tags') tags: string): Promise<RadioStation[]> {
    return this.radioStationService.getByTags(tags);
  }
}

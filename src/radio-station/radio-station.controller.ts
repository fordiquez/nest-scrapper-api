import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { RadioStationService } from './radio-station.service';
import { RadioStation } from './radio-station.entity';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRadioStationDto } from './dto/create-radio-station.dto';

@ApiTags('radio stations')
@Controller('radio-station')
export class RadioStationController {
  constructor(private readonly radioStationService: RadioStationService) {}

  @Post()
  @ApiOperation({
    summary: 'parse radio stations',
    description:
      'parse radio stations by country code from <a href="https://onlineradiobox.com">onlineradiobox</a>',
  })
  @ApiBody({
    type: CreateRadioStationDto,
    description: 'Country code',
    required: true,
    isArray: false,
  })
  @ApiCreatedResponse({
    description: 'The radio stations has been successfully created.',
    type: [RadioStation],
  })
  async create(
    @Body('country') createRadioStationDto: CreateRadioStationDto,
  ): Promise<void> {
    return await this.radioStationService.create(createRadioStationDto);
  }

  @Get(':radioId')
  @ApiOperation({ summary: 'Gets all radio stations by radio ID' })
  @ApiOkResponse({
    description: 'Radio station retrieved successfully',
    type: RadioStation,
  })
  @ApiNotFoundResponse({ description: 'Radio station not found' })
  async getByRadioId(
    @Param('radioId', ParseIntPipe) radioId: number,
  ): Promise<RadioStation> {
    return this.radioStationService.getByRadioId(radioId);
  }

  @Get()
  @ApiOperation({ summary: 'Gets all radio stations by tags' })
  @ApiOkResponse({
    description: 'Radio stations retrieved successfully',
    type: [RadioStation],
  })
  @ApiNotFoundResponse({ description: 'Radio stations not found' })
  async getByTags(@Query('tags') tags: string): Promise<RadioStation[]> {
    return this.radioStationService.getByTags(tags);
  }
}

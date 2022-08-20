import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { RadioStationService } from './radio-station.service';
import { RadioStation } from './radio-station.entity';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRadioStationDto } from './dto/create-radio-station.dto';
import { Response } from 'express';

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
  @ApiBadRequestResponse({
    description: 'Radio stations by such country code was not found',
  })
  async create(
    @Body() createRadioStationDto: CreateRadioStationDto,
  ): Promise<object> {
    const country = createRadioStationDto.country;
    try {
      await this.radioStationService.create(country);
      return {
        statusCode: HttpStatus.CREATED,
        message: `The radio stations by country code: ${country} created successfully!`,
      };
    } catch (e) {
      return {
        code: e.code,
        message: e.message,
      };
    }
  }

  @Get(':radioId')
  @ApiOperation({ summary: 'Gets radio station by radio ID' })
  @ApiOkResponse({
    description: 'Radio station retrieved successfully',
    type: RadioStation,
  })
  @ApiNotFoundResponse({ description: 'Radio station not found' })
  async getByRadioId(
    @Param('radioId') radioId: string,
    @Res() res: Response,
  ): Promise<Promise<object> | Promise<RadioStation[]>> {
    try {
      const radioStation = await this.radioStationService.getByRadioId(radioId);
      if (!radioStation)
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Radio station with such radio ID was not found',
        });
      return res.json(radioStation);
    } catch (e) {
      return {
        code: e.code,
        message: e.message,
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Gets radio stations by tag(s) or retrieve all available',
  })
  @ApiOkResponse({
    description: 'Radio stations retrieved successfully',
    type: [RadioStation],
  })
  @ApiNotFoundResponse({ description: 'Radio stations was not found' })
  async getByTags(
    @Query('tags') tags: string,
    @Res() res: Response,
  ): Promise<Promise<object> | Promise<RadioStation[]>> {
    try {
      const radioStations = !tags
        ? await this.radioStationService.getAll()
        : await this.radioStationService.getByTags(tags);
      if (!radioStations.length)
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'None radio station was not found',
        });
      return res.json(radioStations);
    } catch (e) {
      return {
        code: e.code,
        message: e.message,
      };
    }
  }
}

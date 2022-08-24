import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Image } from './image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { ImageService } from './image.service';
import { RadioStation } from '../radio-station/radio-station.entity';

@ApiTags('Images')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload image file',
    description:
      'Resize image and upload to AWS S3 and save image urls & filename keys in MySQL table',
  })
  @ApiBody({
    type: CreateImageDto,
    description: 'Image dimension options',
    required: true,
    isArray: false,
  })
  @ApiCreatedResponse({
    description: 'The image file has been successfully resized and saved.',
    type: [Image],
  })
  @ApiBadRequestResponse({
    description: 'The request cannot be fulfilled due to bad syntax.',
  })
  async uploadImage(
    @Body() dimensions,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const errors = this.imageService.imageValidation(
        dimensions,
        file.mimetype,
      );
      if (!errors.length) {
        const image = await this.imageService.uploadImage(
          file.buffer,
          file.originalname,
          dimensions,
        );
        return res.json(image);
      }
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errors.length > 1 ? errors : errors[0],
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        code: e.code,
        message: e.message,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get urls of image by ID' })
  @ApiOkResponse({
    description: 'Image urls retrieved successfully',
    type: Image,
  })
  @ApiNotFoundResponse({ description: 'Image not found' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<Response | object> {
    try {
      const image = await this.imageService.getById(id);
      if (!image)
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Image with such image ID was not found',
        });
      return res.json(image);
    } catch (e) {
      return {
        code: e.code,
        message: e.message,
      };
    }
  }
}

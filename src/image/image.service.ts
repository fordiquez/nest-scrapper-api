import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import * as sharp from 'sharp';
import { Image } from './image.entity';
import * as Joi from 'joi';

@Injectable()
export class ImageService {
  private bucket: string = process.env.AWS_BUCKET_NAME;

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async uploadImage(
    dataBuffer: Buffer,
    filename: string,
    dimensions: object,
  ): Promise<Image> {
    const hasDimensions = this.validateBody(dimensions);
    const resizedBuffer = !hasDimensions
      ? await this.resize(dataBuffer)
      : await this.resize(dataBuffer, dimensions);
    const originalImage = await this.awsUpload(dataBuffer, filename);
    const resizedImage = await this.awsUpload(resizedBuffer, filename);

    const image = this.imageRepository.create({
      originalKey: originalImage.Key,
      originalUrl: originalImage.Location,
      resizedKey: resizedImage.Key,
      resizedUrl: resizedImage.Location,
    });
    console.log(image);
    await this.imageRepository.save(image);

    return image;
  }

  async getById(id: number): Promise<Image> {
    return this.imageRepository.findOneBy({ id });
  }

  async resize(
    buffer,
    options: { width?: string | number; height?: string | number } = {
      width: 480,
      height: 360,
    },
  ) {
    return sharp(buffer)
      .resize(parseInt(String(options.width)), parseInt(String(options.height)))
      .toBuffer();
  }

  async awsUpload(dataBuffer: Buffer, filename: string): Promise<any> {
    const s3 = new S3();
    return await s3
      .upload({
        Bucket: this.bucket,
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();
  }

  validateBody(dimensions: object): boolean {
    let isValidated = true;
    if (!dimensions || Object.keys(dimensions).length !== 2)
      isValidated = false;
    const keys = ['width', 'height'];
    Object.keys(dimensions).forEach((key) => {
      if (!keys.includes(key)) isValidated = false;
    });
    return isValidated;
  }

  validateDimensions(dimensions: object): object {
    const schema = Joi.object().keys({
      width: Joi.number().min(480).max(65535),
      height: Joi.number().min(360).max(65535),
    });

    return schema.validate(dimensions);
  }

  validateFile(mimetype: string): object {
    const file = { mimetype };
    const schema = Joi.object().keys({
      mimetype: Joi.string().valid(
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
      ),
    });

    return schema.validate(file);
  }

  parseErrors(fileErrors, dimensionErrors): any[] {
    const errors = [];

    if (fileErrors.error !== undefined) errors.push(fileErrors.error.message);
    if (dimensionErrors.error !== undefined)
      errors.push(dimensionErrors.error.message);

    return errors;
  }
}

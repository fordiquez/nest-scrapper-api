import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import * as sharp from 'sharp';
import { Image } from './image.entity';

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
    const resizedBuffer = await this.resize(dataBuffer, dimensions);
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

  async awsUpload(dataBuffer, filename) {
    const s3 = new S3();
    return await s3
      .upload({
        Bucket: this.bucket,
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();
  }

  imageValidation(dimensions: object, mimetype: string): any[] {
    const errors = [];
    const MIN_WIDTH = 480;
    const MIN_HEIGHT = 360;
    const MAX_SIZE = 65535;
    const types = mimetype.split('/');
    const imagesTypes = ['jpeg', 'jpg', 'png', 'webp'];
    if (types[0] !== 'image' || !imagesTypes.includes(types[1]))
      errors.push('File do not accept this type!');
    if (!dimensions || Object.keys(dimensions).length === 0)
      errors.push('Not recognized dimension properties!');
    const keys = ['width', 'height'];
    Object.entries(dimensions).forEach(([key, value]) => {
      if (!keys.includes(key)) errors.push(`Property: ${key} is not accepted!`);
      if (isNaN(parseInt(value)))
        errors.push(`${value} of ${key} property must be compatible with Int`);
      else if (parseInt(value) > MAX_SIZE)
        errors.push(
          `The maximum ${key} of image can not be more than ${MAX_SIZE}px`,
        );
      else if (key === keys[0] && parseInt(value) < MIN_WIDTH)
        errors.push(
          `The minimum ${key} of image can not be lower than ${MIN_WIDTH}px`,
        );
      else if (key === keys[1] && parseInt(value) < MIN_HEIGHT)
        errors.push(
          `The minimum ${key} of image can not be lower than ${MIN_HEIGHT}px`,
        );
    });
    return errors;
  }
}

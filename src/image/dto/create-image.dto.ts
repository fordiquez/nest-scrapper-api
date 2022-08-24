import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Length } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    type: String,
    format: 'binary',
    title: 'Image file',
    description: 'Image file with image/ extensions',
    required: true,
    isArray: false,
  })
  @IsNotEmpty()
  image: any;

  @ApiProperty({
    type: Number,
    title: 'Image width dimension option',
    description: "Using 'width' dimension property for resize image file",
    required: true,
    isArray: false,
    default: 480,
    minimum: 480,
    maximum: 65535,
  })
  @IsNumber()
  @IsNotEmpty()
  @Length(3, 5)
  readonly width: number;

  @ApiProperty({
    type: Number,
    title: 'Image height dimension option',
    description: "Using 'height' dimension property for resize image file",
    required: true,
    isArray: false,
    default: 360,
    minimum: 480,
    maximum: 65535,
  })
  @IsNumber()
  @IsNotEmpty()
  @Length(3, 5)
  readonly height: number;
}

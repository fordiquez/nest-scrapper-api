import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateRadioStationDto {
  @ApiProperty({
    title: 'Country code',
    description: 'Using for parse radio stations by country code',
    type: String,
    default: 'ua',
    isArray: false,
    required: true,
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  readonly country: string;
}

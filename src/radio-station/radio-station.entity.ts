import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class RadioStation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  radioId: string;

  @Column()
  title: string;

  @Column()
  country: string;

  @Column()
  stream: string;

  @Column()
  website: string;

  @Column()
  url: string;

  @Column()
  imgUrl: string;

  @Column('simple-array')
  tags: string[];
}

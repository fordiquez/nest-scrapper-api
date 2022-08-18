import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class RadioStation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  radioId: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  imgUrl: string;

  @Column()
  website: string;

  @Column('simple-array')
  tags: string[];

  @Column()
  country: string;
}

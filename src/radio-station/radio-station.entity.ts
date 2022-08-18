import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RadioStation {
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

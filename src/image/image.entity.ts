import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public originalKey: string;

  @Column()
  public originalUrl: string;

  @Column()
  public resizedKey: string;

  @Column()
  public resizedUrl: string;
}

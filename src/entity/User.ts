import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '20', unique: true })
  username: string;

  @Column({ type: 'varchar', length: '20' })
  name: string;

  @Column()
  password: string;
}

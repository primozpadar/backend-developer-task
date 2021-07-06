import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Folder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '20' })
  name: string;

  @ManyToOne(() => User, (user) => user.folders, { nullable: false, onDelete: 'CASCADE' })
  user: User;
}

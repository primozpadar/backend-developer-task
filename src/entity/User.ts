import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Folder } from './Folder';

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

  @OneToMany(() => Folder, (folder) => folder.user)
  folders: Folder[];
}

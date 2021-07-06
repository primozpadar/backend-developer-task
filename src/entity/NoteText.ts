import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Folder } from './Folder';
import { User } from './User';

@Entity()
export class NoteText extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '50' })
  heading: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @ManyToOne(() => Folder, { nullable: false, onDelete: 'CASCADE' })
  folder: Folder;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;
}

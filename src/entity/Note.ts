import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Folder } from './Folder';
import { NoteContentList } from './NoteContentList';
import { NoteContentText } from './NoteContentText';
import { User } from './User';

export enum NoteType {
  LIST = 'LIST',
  TEXT = 'TEXT'
}

@Entity()
export class Note extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '50' })
  heading: string;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'enum', enum: NoteType })
  type: NoteType;

  content: NoteContentList | NoteContentText;

  @ManyToOne(() => Folder, { nullable: false, onDelete: 'CASCADE' })
  folder: Folder;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;
}

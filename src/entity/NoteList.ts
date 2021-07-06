import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Folder } from './Folder';

@Entity()
export class NoteList extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '50' })
  heading: string;

  @Column({ type: 'text', array: true })
  items: string[];

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @ManyToOne(() => Folder, { onDelete: 'CASCADE' })
  folder: Folder;
}

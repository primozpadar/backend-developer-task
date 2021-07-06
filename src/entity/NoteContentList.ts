import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './Note';

@Entity()
export class NoteContentList extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', array: true })
  items: string[];

  @OneToOne(() => Note, (note) => note.content, { onDelete: 'CASCADE' })
  @JoinColumn()
  note: Note;
}

import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './Note';

@Entity()
export class NoteContentText extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @OneToOne(() => Note, (note) => note.content)
  @JoinColumn()
  note: Note;
}

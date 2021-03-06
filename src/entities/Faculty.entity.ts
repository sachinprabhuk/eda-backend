import {
  Entity,
  ManyToMany,
  Column,
  PrimaryColumn,
  JoinTable,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Slot } from './Slot.entity';
import { SlotLim } from './SlotLim.entity';


@Entity()
export class Faculty {
  @PrimaryColumn({ length: 30 })
  id: string;

  @Column({ length: 50 })
  name: string;

  @ManyToOne(type => SlotLim)
  @JoinColumn({ name: "designation" })
  slotLim: SlotLim;

  @Column({ length: 50 })
  branch: string;

  @Column({ length: 30 })
  email: string;

  @Column({ length: 12 })
  contact: string;

  @Column({ length: 30 })
  password: string;

  @ManyToMany(type => Slot, slot => slot.faculties, {
    cascade: true,
		onDelete: 'CASCADE'
  })
  @JoinTable({ name: 'selection' })
  selections: Slot[];

}

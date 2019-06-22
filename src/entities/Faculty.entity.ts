import { 
	Entity, ManyToMany, 
	Column, PrimaryColumn, JoinTable 
} from 'typeorm';
import { Slot } from './Slot.entity';

@Entity()
export class Faculty {

	@PrimaryColumn({ length: 30 })
	id: string

	@Column({ length: 50 })
	name: string

	@Column()
	designation: number

	@Column({ length: 50 })
	branch: string

	@Column({ length: 30 })
	email: string

	@Column({ length: 12 })
	contact: string

	@Column({ length: 30 })
	password: string

	@ManyToMany(type => Slot, slot => slot.faculties, { cascade: true })
	@JoinTable({ name: 'selection' })
	selections: Slot[]
	
}
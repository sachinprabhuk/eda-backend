import { Entity, ManyToMany, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Faculty } from './Faculty.entity';

@Entity()
export class Slot {

	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ length: 10 })
	type: string

	@Column()
	date: Date

	@Column()
	total: number

	@Column()
	remaining: number

	@ManyToMany(type => Faculty, fac => fac.selections)
	faculties: Faculty[]

}
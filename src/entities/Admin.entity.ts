import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class Admin {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ length: 50 })
	name: string

	@Column({ length: 20 })
	branch: string

	@Column({ length: 30 })
	email: string

	@Column({ length: 12 })
	contact: string

	@Column({ length: 30 })
	username: string

	@Column({ length: 30 })
	password: string
	
}
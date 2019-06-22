import { Entity, Column, PrimaryColumn } from "typeorm";


@Entity()
export class SlotLim {

	@PrimaryColumn()
	designation: number

	@Column()
	maximum: number

	@Column()
	minimum: number

	@Column()
	mornMax: number

	@Column()
	aftMax: number

}
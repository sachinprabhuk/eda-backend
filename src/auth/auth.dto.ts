export class LoginDTO {
	readonly admin: boolean
	readonly username: string
	readonly password: string
}

export class JWTdecoded {
	readonly admin: boolean
	readonly username: string
}
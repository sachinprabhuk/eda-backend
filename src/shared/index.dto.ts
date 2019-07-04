export class SlotDTO {
  date: Date;
  type: string;
  total: number; // indicates total slots available.
}

export class FacultyDTO {
  id: string;
  name: string;
  branch: string;
  email: string;
  contact: string;
  designation: number;
}

export class JWTdecoded {
  admin: boolean;
  username: string;
}

import { FacultyDTO } from '../shared/index.dto';

export type pendingFaculty = Pick<FacultyDTO, 'id' | 'name' | 'branch'>;

import { default as ax } from 'axios';
import { addFaculty } from '../shared/utils';

let token: string;

const axios = ax.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    authorization: 'test123',
  },
});

beforeAll(async () => {
  await axios.delete(`/admin/all-test`);
});

afterEach(async () => {
  await axios.delete(`/admin/all-test`);
});

////////////////////////////////////////////////////////

describe('pending faculty test', () => {

	it('pending faculty(basic check)', async () => {
		await addFaculty(axios, '1111');

		const { data } = await axios.get("/admin/pending-faculty", {
			params: {
				designation: 1
			}
		})
		console.log("----------------->", data);
	})

})
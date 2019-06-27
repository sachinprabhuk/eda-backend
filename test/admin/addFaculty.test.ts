
import axios from 'axios';
import { addFaculty } from '../shared/utils';

let token: string;

axios.interceptors.request.use(req => {
	req.baseURL = 'http://localhost:3000/api';
	if(req.url.match(/login$/))
		return req;

	req.headers.authorization = token;
	return req;
})

beforeAll(async () => {
	const login = {
		admin: true, username: 'sachin', password: 'prabhu'
	}
	token = (await axios.post(`/auth/login`, login)).data;
	await axios.delete(`/admin/all-test`);
})

afterEach(async () => {
	await axios.delete(`/admin/all-test`);
})

/////////////////////////////////////////////////////////////////

const errmsg = 'Error while adding new faculty!'

describe('add faculty test --------------------', () => {

	it('adds new faculty', async () => {
		expect.assertions(1);

		const { data: res } = await addFaculty(axios, '1111')
		expect(res.id).toEqual("1111")
	})	

	it('throws error for duplicate entry', async () => {
		expect.assertions(1);
		const { data: res } = await addFaculty(axios, '1111');
		try {
			await addFaculty(axios, '1111');
		}catch(e) {
			expect(e.response.data.message).toEqual(errmsg);
		}
	})

	it('throws error for missing id field', async () => {
		const fac = {
			faculty: {
				name: "sachin",
				password: "1111",
				branch: "CSE",
				designation: 1,
				email: "prabhachin44@gmail.com",
				contact: "8277487857"
			}
		}
		try {
			await axios.post('/admin/faculty', fac);
		}catch(e) {
			expect(e.response.data.message).toEqual(errmsg);
		}
	})

	test('missing email field', async () => {
		const fac = {
			faculty: {
				id: "1111",
				name: "sachin",
				password: "1111",
				branch: "CSE",
				designation: 1,
				contact: "8277487857"
			}
		}
		try {
			await axios.post('/admin/faculty', fac);
		}catch(e) {
			expect(e.response.data.message).toEqual(errmsg);
		}
	})
	

	test('missing password field', async () => {
		const fac = {
			faculty: {
				id: "1111",
				name: "sachin",
				branch: "CSE",
				designation: 1,
				email: "asdfasf",
				contact: "8277487857"
			}
		}
		try {
			await axios.post('/admin/faculty', fac);
		}catch(e) {
			expect(e.response.data.message).toEqual(errmsg);
		}
	})


})
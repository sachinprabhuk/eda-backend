import axios from 'axios';

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

///////////////////////////////////////////////////////////////
describe('add slot test ----------------------', () => {
	test('add new slot', async () => {
		const slot1 = {
			slot: {
				type: "morn", total: 10, date: new Date(2018, 10, 5).toISOString()
			}
		}
		const { data: res1 } = await axios.post('/admin/slot', slot1);
		expect(res1.type).toBe("morn")
		expect(res1.id).toBeTruthy();
	})
	
	test('duplicate slot entry', async () => {
		const slot1 = {
			slot: {
				type: "morn", total: 10, date: new Date(2018, 10, 5).toISOString()
			}
		}
		const slot2 = {
			slot: {
				type: "morn", total: 10, date: new Date(2018, 10, 5).toISOString()
			}
		}
		const { data: res1 } = await axios.post('/admin/slot', slot1);
		try {
			await axios.post('/admin/slot', slot2);
		}catch(e) {
			expect(e.response.data.message).toEqual("Duplicate entry!!");
		}
	})
	
	test('missing type field', async () => {
		const slot1 = {
			slot: {
				total: 10, date: new Date(2018, 10, 5).toISOString()
			}
		}
		try {
			await axios.post("/admin/slot", slot1)
		}catch(e) {
			expect(e.response.data.message).toEqual('Error while adding new slot!');
		}
	})
	
	test('missing total field', async () => {
		const slot1 = {
			slot: {
				type: "morn", date: new Date(2018, 10, 5).toISOString()
			}
		}
		try {
			await axios.post("/admin/slot", slot1)
		}catch(e) {
			expect(e.response.data.message).toEqual('Error while adding new slot!');
		}
	})
	
	test('missing date field', async () => {
		const slot1 = {
			slot: {
				total: 10, type: "aft"
			}
		}
		try {
			await axios.post("/admin/slot", slot1)
		}catch(e) {
			expect(e.response.data.message).toEqual('Error while adding new slot!');
		}
	})
})




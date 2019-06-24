import { default as ax } from 'axios';

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


///////////////////////////////////////////////////////////////
describe('delete faculty tests -----------------', () => {
	
	test('invalid faculty id', async () => {
		expect.assertions(1);
		try {
			await axios.delete("/admin/faculty", {
				data: {
					facultyID: '1111'
				}
			})
		}catch(e) {
			expect(e.response.data.message).toBe('Invalid faculty id');
		}
	})

	test("deleteFac increases the remaining slot", async () => {
		expect.assertions(2)
		const slot1 = {
      slot: {
        type: 'morn',
        total: 10,
        date: new Date(2018, 10, 5).toISOString(),
      },
    };
		const { data: resSlot1 } = await axios.post("/admin/slot", slot1);
		const fac1 = {
			faculty: {
        id: '1111',
        name: 'sachin',
        password: '1111',
        branch: 'CSE',
        designation: 1,
        email: 'prabhachin44@gmail.com',
        contact: '8277487857',
      },
		}
		const { data: resFac1 } = await axios.post("/admin/faculty", fac1);

		// slot selection
		const { data: selections } = await axios.post('/faculty/select-slot', {
      user: {
        admin: false,
        username: '1111',
      },
      slotID: resSlot1.id,
		});

		expect(resSlot1.remaining).toBe(selections[0].remaining + 1)

		// delete faculty
		const { data: faculty } = await axios.delete("/admin/faculty", {
			data: {
				facultyID: '1111'
			}
		})
		
		expect(faculty.selections[0].remaining).toBe(resSlot1.remaining);

	})

})
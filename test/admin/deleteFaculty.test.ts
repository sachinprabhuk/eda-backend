import { default as ax } from 'axios';
import { addSlot, slotSelection, addFaculty } from '../shared/utils';

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
		const { data: resSlot1 } = await addSlot(axios, new Date(2018, 10, 5), "morn")

		await addFaculty(axios, '1111');

		// slot selection
		const { data: selections } = await slotSelection(axios, '1111', resSlot1.id)

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
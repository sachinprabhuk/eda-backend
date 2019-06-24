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

//////////////////////////////////////////////////////

describe("delete slot tests----------------------", () => {

	test("invalid slot id", async () => {
		expect.assertions(2);
		
		try {
			await axios.delete("/admin/slot", {
				data: {
					slotID: "rubbish!"
				}
			})
		}catch(e) {
			expect(e.response.data.message).toBe('Invalid slot id')
			expect(e.response.status).toBe(400)
		}
	})

	test("successful deletion", async () => {
		expect.assertions(1);
		const { data: resSlot } = await axios.post("/admin/slot", {
			slot: {
				type: "mor", date: new Date().toISOString(), total: 10
			}
		})
		const { data: resDel } = await axios.delete("/admin/slot", {
			data: {
				slotID: resSlot.id
			}
		})
		expect(resDel.id).toBe(resSlot.id);
	})

})
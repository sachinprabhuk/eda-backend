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

/////////////////////////////////////////////////////////////////

describe('slot selection', () => {
  test('plain slot selection', async () => {
    expect.assertions(5);
    // adding faculty
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
    };
    const fac2 = {
      faculty: {
        id: '1112',
        name: 'sachin',
        password: '1112',
        branch: 'CSE',
        designation: 1,
        email: 'prabhachin44@gmail.com',
        contact: '8277487857',
      },
    };
    const { data: resFac1 } = await axios.post('/admin/faculty', fac1);
    const { data: resFac2 } = await axios.post('/admin/faculty', fac2);

    // adding slots
    const slot1 = {
      slot: {
        type: 'morn',
        total: 10,
        date: new Date(2018, 10, 5).toISOString(),
      },
    };
    const slot2 = {
      slot: {
        type: 'aft',
        total: 10,
        date: new Date(2018, 10, 5).toISOString(),
      },
    };
    const slot3 = {
      slot: {
        type: 'morn',
        total: 10,
        date: new Date(2018, 11, 5).toISOString(),
      },
    };
    const { data: resSlot1 } = await axios.post('/admin/slot', slot1);
    const { data: resSlot2 } = await axios.post('/admin/slot', slot2);
    const { data: resSlot3 } = await axios.post('/admin/slot', slot3);

    // selecting slots
    await axios.post('/faculty/select-slot', {
      // 1st user selects 1st slot
      user: {
        admin: false,
        username: '1111',
      },
      slotID: resSlot1.id,
    });
    await axios.post('/faculty/select-slot', {
      // 2nd user selects 1st slot
      user: {
        admin: false,
        username: '1112',
      },
      slotID: resSlot1.id,
    });

    const { data: selections } = await axios.post('/faculty/select-slot', {
			// 1st user selects 3rd slot.
      user: {
        admin: false,
        username: '1111',
      },
      slotID: resSlot3.id,
    });

		// assertions.
    expect(selections.length).toBe(2);
    expect(selections[0].id).toBe(resSlot1.id);
    expect(selections[1].id).toBe(resSlot3.id);
    expect(selections[0].remaining).toBe(resSlot1.remaining - 2);
    expect(selections[1].remaining).toBe(resSlot3.remaining - 1);
	});
	
	test("selecting same slot twice", async () => {

	})
});

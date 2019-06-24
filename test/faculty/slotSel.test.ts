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

// beforeEach(async () => {
//   // inserting 2 faculties and 3 slots, beforeEach :P

// })

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

  test('selecting same slot twice', async () => {
    expect.assertions(2);
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
    const { data: resFac1 } = await axios.post('/admin/faculty', fac1);

    const slot1 = {
      slot: {
        type: 'morn',
        total: 10,
        date: new Date(2018, 10, 5).toISOString(),
      },
    };
    const { data: resSlot1 } = await axios.post('/admin/slot', slot1);

    await axios.post('/faculty/select-slot', {
      // 2nd user selects 1st slot
      user: {
        admin: false,
        username: '1111',
      },
      slotID: resSlot1.id,
    });
    try {
      await axios.post('/faculty/select-slot', {
        // 2nd user selects 1st slot
        user: {
          admin: false,
          username: '1111',
        },
        slotID: resSlot1.id,
      });
    } catch (e) {
      expect(e.response.data.message).toBe(
        'You have already selected a slot on this date',
      );
      expect(e.response.status).toBe(400);
    }
  });

  test('selecting a slot on the same date(one in morn, on in noon)', async () => {
    expect.assertions(2);
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
    const { data: resFac1 } = await axios.post('/admin/faculty', fac1);

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
    const { data: resSlot1 } = await axios.post('/admin/slot', slot1);
    const { data: resSlot2 } = await axios.post('/admin/slot', slot2);

    await axios.post('/faculty/select-slot', {
      // 2nd user selects 1st slot
      user: {
        admin: false,
        username: '1111',
      },
      slotID: resSlot1.id,
    });
    try {
      await axios.post('/faculty/select-slot', {
        // 2nd user selects 1st slot
        user: {
          admin: false,
          username: '1111',
        },
        slotID: resSlot2.id,
      });
    } catch (e) {
      expect(e.response.data.message).toBe(
        'You have already selected a slot on this date',
      );
      expect(e.response.status).toBe(400);
    }
  });

  test('selecting when no slot is available(0 condition)', async () => {
    expect.assertions(2);
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
    const { data: resFac1 } = await axios.post('/admin/faculty', fac1);

    const slot1 = {
      slot: {
        type: 'morn',
        total: 0,
        date: new Date(2018, 10, 5).toISOString(),
      },
    };
    const { data: resSlot1 } = await axios.post('/admin/slot', slot1);
    try {
      await axios.post('/faculty/select-slot', {
        // 2nd user selects 1st slot
        user: {
          admin: false,
          username: '1111',
        },
        slotID: resSlot1.id,
      });
    } catch (e) {
      expect(e.response.data.message).toBe('No more slot left!sorry');
      expect(e.response.status).toBe(400);
    }
  });

  test('invalid faculty id condition', async () => {
    expect.assertions(2);
    try {
      const slot1 = {
        slot: {
          type: 'morn',
          total: 10,
          date: new Date(2018, 10, 5).toISOString(),
        },
      };
      const { data: resSlot1 } = await axios.post('/admin/slot', slot1);
      await axios.post('/faculty/select-slot', {
        user: {
          username: '1111',
          admin: false,
        },
        slotID: resSlot1.id,
      });
    } catch (e) {
      expect(e.response.status).toBe(400);
      expect(e.response.data.message).toBe('Invalid faculty id');
    }
  });

  test('invalid slot id condition', async () => {
    expect.assertions(2);
    try {
      expect.assertions(2);
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
      const { data: resFac1 } = await axios.post('/admin/faculty', fac1);
      await axios.post('/faculty/select-slot', {
        user: {
          username: '1111',
          admin: false,
        },
        slotID: 'vatraashi_id',
      });
    } catch (e) {
      expect(e.response.status).toBe(400);
      expect(e.response.data.message).toBe('Invalid slot id');
    }
  });


});

import { default as ax } from 'axios';

let token: string;

const axios = ax.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    authorization: 'test123',
  },
});

afterAll(async () => {
  await axios.delete(`/admin/all-test`);
});

let d1, d2, d3, slots, slotids: Array<any>;
beforeEach(async () => {
  await axios.delete(`/admin/all-test`);
  // ready the slots.
  d1 = new Date(2018, 6, 10);
  d2 = new Date(2018, 6, 11);
  d3 = new Date(2018, 6, 12);
  slots = [
    { type: 'morn', date: d1, total: 10 },
    { type: 'morn', date: d2, total: 10 },
    { type: 'aft', date: d1, total: 10 },
    { type: 'aft', date: d2, total: 10 },
    { type: 'aft', date: d3, total: 10 },
  ];

  // upload the slots and take slot ids.
  slotids = (await Promise.all(
    slots.map(slot => axios.post('/admin/slot', { slot })),
  )).map((p: any) => {
    return p.data.id;
  });
});

const getSQLtime = (date: Date) => {
  return new Date(date.getTime() + 330 * 60 * 1000).toISOString().slice(0, 10);
};

///////////////////////////////////////////////

describe('report tests-----------------------', () => {
  test('getting meta data', async () => {
    try {
      expect.assertions(5);

      // prep the expected slot array.
      const expected = slots.map(slot => getSQLtime(slot.date));

      // fetching report meta of the form { morn: [], aft: [] }
      const { data } = await axios.get('/admin/report-meta');

      // parsing to an array of dates.
      const received = Object.keys(data).reduce(
        (acc, curr) => acc.concat(data[curr]),
        [],
      );

      // comparing expected and received.
      expected.forEach(curr => {
        expect(received).toContain(curr);
      });
    } catch (e) {
      console.log(e);
    }
  });

  it('fetching report', async () => {
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
    const fac2 = {
      faculty: {
        id: '1112',
        name: 'sachin!!',
        password: '1112',
        branch: 'CSE',
        designation: 1,
        email: 'prabhachin44@gmail.com',
        contact: '8277487857',
      },
    };
    const { data: res1 } = await axios.post('/admin/faculty', fac1);
    const { data: res2 } = await axios.post('/admin/faculty', fac2);
    await axios.post('/faculty/select-slot', {
      // 1st user selects 1st slot
      user: {
        admin: false,
        username: '1111',
      },
      slotID: slotids[0],
    });
    await axios.post('/faculty/select-slot', {
      // 1st user selects 1st slot
      user: {
        admin: false,
        username: '1112',
      },
      slotID: slotids[0],
    });

    // fetching report
    const { data: report } = await axios.get('/admin/report', {
      params: {
        type: 'morn',
        date: d1.toISOString(),
      },
    });

    const ids = report.map(el => el.id);
    expect(ids).toContain('1111');
    expect(ids).toContain('1112');
  });

  it('fetches empty report for valid date', async () => {
    // fetching report
    const { data: report } = await axios.get('/admin/report', {
      params: {
        type: 'morn',
        date: d1.toISOString(),
      },
    });
    expect(report).toEqual([])
  });

});

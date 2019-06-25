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

const getSQLtime = (date: Date) => {
  return new Date(date.getTime() + 330 * 60 * 1000).toISOString().slice(0, 10);
};

///////////////////////////////////////////////

describe('report tests-----------------------', () => {
  test('getting meta data', async () => {
    try {
      expect.assertions(5);

      // ready the slots.
      let d1 = new Date(2018, 6, 10);
      let d2 = new Date(2018, 6, 11);
      let d3 = new Date(2018, 6, 12);
      const slots = [
        { type: 'morn', date: d1, total: 10 },
        { type: 'morn', date: d2, total: 10 },
        { type: 'aft', date: d1, total: 10 },
        { type: 'aft', date: d2, total: 10 },
        { type: 'aft', date: d3, total: 10 },
      ];

      // upload the slots
      await Promise.all(slots.map(slot => axios.post('/admin/slot', { slot })));

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
});

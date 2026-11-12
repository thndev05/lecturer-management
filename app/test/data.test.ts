import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paginateLecturers, selectLecturers, validClassCount } from '../src/lib/data.ts';

const rows = [
  { IDGV: 'GV03', Fullname: 'Trần Bình', SumClass: 6, Image: '' },
  { IDGV: 'GV01', Fullname: 'Nguyễn An', SumClass: 0, Image: '' },
  { IDGV: 'GV02', Fullname: 'Lê Chi', SumClass: 5, Image: '' },
];
test('search is trimmed, case insensitive, accent sensitive and treats regex literally', () => {
  assert.deepEqual(
    selectLecturers(rows, ' gv01 ', 'all', 'code', 'vi').map((row) => row.IDGV),
    ['GV01'],
  );
  assert.equal(selectLecturers(rows, 'NGUYỄN', 'all', 'code', 'vi').length, 1);
  assert.equal(selectLecturers(rows, 'Nguyen', 'all', 'code', 'vi').length, 0);
  assert.equal(selectLecturers(rows, '.*', 'all', 'code', 'vi').length, 0);
});
test('filters include exact boundaries and sorting leaves cached input unchanged', () => {
  assert.deepEqual(
    selectLecturers(rows, '', 'few', 'code', 'vi').map((row) => row.IDGV),
    ['GV02'],
  );
  assert.equal(selectLecturers(rows, '', 'zero', 'code', 'vi')[0].SumClass, 0);
  assert.equal(selectLecturers(rows, '', 'many', 'code', 'vi')[0].SumClass, 6);
  assert.deepEqual(
    selectLecturers(rows, '', 'all', 'asc', 'vi').map((row) => row.SumClass),
    [0, 5, 6],
  );
  assert.deepEqual(
    selectLecturers(rows, '', 'all', 'desc', 'vi').map((row) => row.SumClass),
    [6, 5, 0],
  );
  assert.equal(rows[0].IDGV, 'GV03');
});
test('class count rejects negatives, decimals, empty values and unsafe integers', () => {
  for (const value of ['', ' ', '-1', '1.5', '1e2', 'NaN', '9007199254740992'])
    assert.equal(validClassCount(value), false, value);
  for (const value of ['0', '12', ' 5 ', '9007199254740991'])
    assert.equal(validClassCount(value), true, value);
});

test('pagination returns ten documents per page without mutating the full list', () => {
  const all = Array.from({ length: 23 }, (_, index) => ({ ...rows[0], IDGV: `GV${index + 1}` }));
  const first = paginateLecturers(all, 1);
  assert.equal(first.items.length, 10);
  assert.equal(first.start, 1);
  assert.equal(first.end, 10);
  assert.equal(first.totalPages, 3);
  const second = paginateLecturers(all, 2);
  assert.equal(second.items[0].IDGV, 'GV11');
  assert.equal(second.items.length, 10);
  const last = paginateLecturers(all, 3);
  assert.equal(last.items.length, 3);
  assert.equal(last.start, 21);
  assert.equal(last.end, 23);
  assert.equal(all.length, 23);
  assert.equal(paginateLecturers(all.slice(0, 13), 2).items.length, 3);
  assert.equal(paginateLecturers(all.slice(0, 20), 2).items.length, 10);
});

test('pagination handles empty results and clamps the page after filtering or deletion', () => {
  assert.deepEqual(paginateLecturers([], 3), {
    page: 1,
    totalPages: 1,
    items: [],
    start: 0,
    end: 0,
  });
  const reduced = paginateLecturers(rows, 3);
  assert.equal(reduced.page, 1);
  assert.equal(reduced.items.length, 3);
  const filtered = selectLecturers(rows, 'GV02', 'all', 'code', 'vi');
  assert.equal(paginateLecturers(filtered, 2).items[0].IDGV, 'GV02');
  assert.equal(paginateLecturers(rows, 0).page, 1);
});

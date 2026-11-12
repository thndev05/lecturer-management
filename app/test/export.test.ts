import assert from 'node:assert/strict';
import { test } from 'node:test';
import { read, utils } from 'xlsx';
import { buildExport } from '../src/lib/export-data.ts';

const rows = [
  {
    _id: 'not-exported',
    IDGV: 'GV001',
    Fullname: 'Nguyễn Thị Ánh',
    Image: 'https://res.cloudinary.com/demo/a.jpg',
    SumClass: 0,
  },
];
test('JSON exports only the four business fields and handles an empty list', () => {
  const file = buildExport(rows, 'json');
  assert.equal(file.filename, 'GiangVien.json');
  const result = JSON.parse(file.content as string);
  assert.deepEqual(Object.keys(result[0]), ['IDGV', 'Fullname', 'Image', 'SumClass']);
  assert.equal(result[0].Fullname, rows[0].Fullname);
  assert.equal(buildExport([], 'json').content, '[]');
});
test('Excel round-trips Vietnamese text, numeric counts, and literal formula-like strings', () => {
  const file = buildExport(
    [...rows, { ...rows[0], IDGV: '=1+1', Fullname: '+example', SumClass: 12 }],
    'xlsx',
  );
  assert.equal(file.filename, 'GiangVien.xlsx');
  const book = read(file.content, { type: 'array' });
  const sheet = book.Sheets.GiangVien;
  const result = utils.sheet_to_json(sheet);
  assert.equal(result[0].Fullname, rows[0].Fullname);
  assert.equal(result[0].SumClass, 0);
  assert.equal(sheet.A3.t, 's');
  assert.equal(sheet.A3.f, undefined);
  assert.equal(sheet.A3.v, '=1+1');
  assert.equal(sheet.D3.t, 'n');
  assert.equal(JSON.stringify(result).includes('_id'), false);
});
test('empty Excel keeps column headers', () => {
  const file = buildExport([], 'xlsx');
  const book = read(file.content, { type: 'array' });
  assert.deepEqual(utils.sheet_to_json(book.Sheets.GiangVien, { header: 1 }), [
    ['IDGV', 'Fullname', 'Image', 'SumClass'],
  ]);
});

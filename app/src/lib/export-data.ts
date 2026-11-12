import { utils, write } from 'xlsx';
import type { Lecturer } from './data';

export type ExportFormat = 'xlsx' | 'json';

export function buildExport(rows: Lecturer[], format: ExportFormat) {
  const data = rows.map(({ IDGV, Fullname, Image, SumClass }) => ({
    IDGV,
    Fullname,
    Image,
    SumClass,
  }));
  if (format === 'json') {
    return {
      filename: 'GiangVien.json',
      mimeType: 'application/json',
      uti: 'public.json',
      content: JSON.stringify(data, null, 2),
    };
  }
  const sheet = utils.aoa_to_sheet([
    ['IDGV', 'Fullname', 'Image', 'SumClass'],
    ...data.map(({ IDGV, Fullname, Image, SumClass }) => [IDGV, Fullname, Image, SumClass]),
  ]);
  sheet['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 70 }, { wch: 12 }];
  const book = utils.book_new();
  utils.book_append_sheet(book, sheet, 'GiangVien');
  return {
    filename: 'GiangVien.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uti: 'org.openxmlformats.spreadsheetml.sheet',
    content: new Uint8Array(write(book, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer),
  };
}

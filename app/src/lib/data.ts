export type Lecturer = {
  _id?: string;
  IDGV: string;
  Fullname: string;
  Image: string;
  SumClass: number;
};
export type Admin = { _id: string; Fullname: string; Email: string };
export type ClassFilter = 'all' | 'zero' | 'few' | 'many';
export type Sort = 'code' | 'name' | 'asc' | 'desc';
export function selectLecturers(
  rows: Lecturer[],
  search: string,
  filter: ClassFilter,
  sort: Sort,
  locale: string,
) {
  const term = search.trim().toLocaleLowerCase(locale);
  return rows
    .filter(
      (row) =>
        (!term || `${row.IDGV} ${row.Fullname}`.toLocaleLowerCase(locale).includes(term)) &&
        (filter === 'all' ||
          (filter === 'zero'
            ? row.SumClass === 0
            : filter === 'few'
              ? row.SumClass >= 1 && row.SumClass <= 5
              : row.SumClass > 5)),
    )
    .sort((a, b) =>
      sort === 'name'
        ? a.Fullname.localeCompare(b.Fullname, locale)
        : sort === 'code'
          ? a.IDGV.localeCompare(b.IDGV, locale)
          : (sort === 'asc' ? a.SumClass - b.SumClass : b.SumClass - a.SumClass) ||
            a.IDGV.localeCompare(b.IDGV),
    );
}
export function validClassCount(value: string) {
  return /^\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value));
}

export function paginateLecturers(rows: Lecturer[], requestedPage: number) {
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const offset = (page - 1) * pageSize;
  return {
    page,
    totalPages,
    items: rows.slice(offset, offset + pageSize),
    start: rows.length ? offset + 1 : 0,
    end: Math.min(offset + pageSize, rows.length),
  };
}

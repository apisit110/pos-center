export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function toPaginatedResponseDto<T, U>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  map: (item: T) => U,
): PaginatedResponseDto<U> {
  return { items: items.map(map), total, page, limit };
}

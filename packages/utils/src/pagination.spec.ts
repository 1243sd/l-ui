import { describe, expect, it } from 'vitest';
import { mergePagination, normalizePagination, toPaginationRequest } from './pagination';

describe('pagination utils', () => {
  it('normalizes invalid input values', () => {
    const normalized = normalizePagination({
      current: -3,
      pageSize: 0,
      total: -1
    });

    expect(normalized).toEqual({
      current: 1,
      pageSize: 20,
      total: 0
    });
  });

  it('clamps current page when total changes', () => {
    const merged = mergePagination(
      {
        current: 5,
        pageSize: 10,
        total: 50
      },
      {
        total: 15
      }
    );

    expect(merged.current).toBe(2);
    expect(merged.total).toBe(15);
  });

  it('builds offset/limit payload', () => {
    const payload = toPaginationRequest({
      current: 3,
      pageSize: 25,
      total: 500
    });

    expect(payload).toEqual({
      current: 3,
      pageSize: 25,
      offset: 50,
      limit: 25
    });
  });
});

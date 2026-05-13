export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

export interface PaginationInput {
  current?: number | null;
  pageSize?: number | null;
  total?: number | null;
}

export interface PaginationRequest {
  current: number;
  pageSize: number;
  offset: number;
  limit: number;
}

export const DEFAULT_PAGINATION: PaginationState = {
  current: 1,
  pageSize: 20,
  total: 0
};

const toPositiveInteger = (value: number | null | undefined, fallback: number): number => {
  const normalized = Number.isFinite(value) ? Math.trunc(Number(value)) : fallback;
  return normalized > 0 ? normalized : fallback;
};

const toNonNegativeInteger = (value: number | null | undefined, fallback: number): number => {
  const normalized = Number.isFinite(value) ? Math.trunc(Number(value)) : fallback;
  return normalized >= 0 ? normalized : fallback;
};

export const normalizePagination = (
  input: PaginationInput = {},
  base: PaginationState = DEFAULT_PAGINATION
): PaginationState => {
  const pageSize = toPositiveInteger(input.pageSize, base.pageSize);
  const total = toNonNegativeInteger(input.total, base.total);
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const requestedCurrent = toPositiveInteger(input.current, base.current);

  return {
    current: Math.min(requestedCurrent, maxPage),
    pageSize,
    total
  };
};

export const mergePagination = (state: PaginationState, patch: PaginationInput): PaginationState => {
  return normalizePagination(
    {
      current: patch.current ?? state.current,
      pageSize: patch.pageSize ?? state.pageSize,
      total: patch.total ?? state.total
    },
    state
  );
};

export const toPaginationRequest = (state: PaginationState): PaginationRequest => {
  const normalized = normalizePagination(state, state);

  return {
    current: normalized.current,
    pageSize: normalized.pageSize,
    offset: (normalized.current - 1) * normalized.pageSize,
    limit: normalized.pageSize
  };
};

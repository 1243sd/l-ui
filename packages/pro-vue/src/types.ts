import type { VNodeChild } from 'vue';

export type ProPagination = {
  current: number;
  pageSize: number;
  total: number;
};

export type ProQueryPayload<TForm extends Record<string, unknown> = Record<string, unknown>> = {
  pagination: {
    current: number;
    pageSize: number;
  };
  formValues: TForm;
  signal: AbortSignal;
  attempt: number;
};

export type ProSearchTableResult<TRow> = {
  data: TRow[];
  total: number;
};

export type ProSearchTableRequest<
  TRow,
  TForm extends Record<string, unknown> = Record<string, unknown>
> = (payload: ProQueryPayload<TForm>) => Promise<ProSearchTableResult<TRow>>;

export type ProSearchTableLifecycle<
  TRow,
  TForm extends Record<string, unknown> = Record<string, unknown>
> = {
  beforeQuery?: (
    payload: Pick<ProQueryPayload<TForm>, 'pagination' | 'formValues'>
  ) =>
    | Pick<ProQueryPayload<TForm>, 'pagination' | 'formValues'>
    | false
    | Promise<Pick<ProQueryPayload<TForm>, 'pagination' | 'formValues'> | false>;
  transform?: (result: ProSearchTableResult<TRow>) => ProSearchTableResult<TRow> | Promise<ProSearchTableResult<TRow>>;
  afterQuery?: (
    result: ProSearchTableResult<TRow>,
    payload: Pick<ProQueryPayload<TForm>, 'pagination' | 'formValues'>
  ) => void | Promise<void>;
};

export type SearchFieldOption = {
  label: string;
  value: string | number | boolean;
};

export type SearchFieldSchema = {
  name: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  defaultValue?: string | number | boolean;
  width?: string | number;
  options?: SearchFieldOption[];
};

export type ProTableColumn<TRow> = {
  key: string;
  title: string;
  dataIndex?: keyof TRow | string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (row: TRow, index: number) => VNodeChild;
};

export type ProRowAction<TRow> = {
  key: string;
  label: string;
  onClick: (row: TRow, index: number) => void;
  disabled?: (row: TRow, index: number) => boolean;
};

export type ProToolbarAction = {
  key: string;
  label: string;
  onClick: () => void;
};

import type { CascaderOption, TableRowKey } from '@lolita-ui/components-vue';
import type { VNodeChild } from 'vue';

export type ProPagination = {
  current: number;
  pageSize: number;
  total: number;
};

export type SearchFormValues = Record<string, unknown>;
export type SearchQueryValues = Record<string, unknown>;

export type ProQueryPayload<
  TForm extends SearchFormValues = SearchFormValues,
  TQuery extends SearchQueryValues = SearchQueryValues
> = {
  pagination: {
    current: number;
    pageSize: number;
  };
  formValues: TForm;
  queryValues: TQuery;
  signal: AbortSignal;
  attempt: number;
};

export type ProSearchTableResult<TRow> = {
  data: TRow[];
  total: number;
};

export type ProSearchTableRequest<
  TRow,
  TForm extends SearchFormValues = SearchFormValues,
  TQuery extends SearchQueryValues = SearchQueryValues
> = (payload: ProQueryPayload<TForm, TQuery>) => Promise<ProSearchTableResult<TRow>>;

export type ProSearchTableLifecycle<
  TRow,
  TForm extends SearchFormValues = SearchFormValues,
  TQuery extends SearchQueryValues = SearchQueryValues
> = {
  beforeQuery?: (
    payload: Pick<ProQueryPayload<TForm, TQuery>, 'pagination' | 'formValues' | 'queryValues'>
  ) =>
    | Pick<ProQueryPayload<TForm, TQuery>, 'pagination' | 'formValues' | 'queryValues'>
    | false
    | Promise<
        | Pick<ProQueryPayload<TForm, TQuery>, 'pagination' | 'formValues' | 'queryValues'>
        | false
      >;
  transform?: (result: ProSearchTableResult<TRow>) => ProSearchTableResult<TRow> | Promise<ProSearchTableResult<TRow>>;
  afterQuery?: (
    result: ProSearchTableResult<TRow>,
    payload: Pick<ProQueryPayload<TForm, TQuery>, 'pagination' | 'formValues' | 'queryValues'>
  ) => void | Promise<void>;
};

export type SearchFieldSelectValue = string | number | boolean;

export type SearchFieldOption = {
  label: string;
  value: SearchFieldSelectValue;
};

type SearchFieldBase = {
  name: string;
  label: string;
  width?: string | number;
  placeholder?: string;
};

export type SearchTextField = SearchFieldBase & {
  type: 'text';
  defaultValue?: string;
  inputProps?: {
    allowClear?: boolean;
  };
  toQuery?: (value: string, formValues: SearchFormValues) => SearchQueryValues;
};

export type SearchSelectField = SearchFieldBase & {
  type: 'select';
  options: SearchFieldOption[];
  defaultValue?: SearchFieldSelectValue;
  selectProps?: {
    allowClear?: boolean;
    showSearch?: boolean;
    loading?: boolean;
    notFoundContent?: string;
  };
  toQuery?: (
    value: SearchFieldSelectValue | undefined,
    formValues: SearchFormValues
  ) => SearchQueryValues;
};

export type SearchDateField = SearchFieldBase & {
  type: 'date';
  defaultValue?: string;
  datePickerProps?: {
    allowClear?: boolean;
    format?: string;
  };
  toQuery?: (value: string | undefined, formValues: SearchFormValues) => SearchQueryValues;
};

export type SearchCascaderField = SearchFieldBase & {
  type: 'cascader';
  options: CascaderOption[];
  defaultValue?: string[];
  cascaderProps?: {
    allowClear?: boolean;
  };
  toQuery?: (value: string[] | undefined, formValues: SearchFormValues) => SearchQueryValues;
};

export type SearchFieldSchema =
  | SearchTextField
  | SearchSelectField
  | SearchDateField
  | SearchCascaderField;

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
  onClick: (row: TRow, index: number) => void | Promise<void>;
  visible?: (row: TRow, index: number) => boolean;
  disabled?: (row: TRow, index: number) => boolean;
  loading?: (row: TRow, index: number) => boolean;
  refreshOnSuccess?: boolean;
};

export type ProToolbarAction = {
  key: string;
  label: string;
  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void | Promise<void>;
};

export type ProRowKey<TRow extends Record<string, unknown> = Record<string, unknown>> = TableRowKey<TRow>;

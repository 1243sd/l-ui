import type {
  ButtonType,
  CascaderOption,
  TableRowKey,
  TableRowSelection,
  TableSortState
} from '@lolita-ui/components-vue';
import type { VNodeChild } from 'vue';

export type ProPagination = {
  current: number;
  pageSize: number;
  total: number;
};

export type SearchFormValues = Record<string, unknown>;
export type SearchQueryValues = Record<string, unknown>;
export type ProFormValues = SearchFormValues;

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
  sortState?: TableSortState;
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
    payload: Pick<
      ProQueryPayload<TForm, TQuery>,
      'pagination' | 'formValues' | 'queryValues' | 'sortState'
    >
  ) =>
    | Pick<
        ProQueryPayload<TForm, TQuery>,
        'pagination' | 'formValues' | 'queryValues' | 'sortState'
      >
    | false
    | Promise<
        | Pick<
            ProQueryPayload<TForm, TQuery>,
            'pagination' | 'formValues' | 'queryValues' | 'sortState'
          >
        | false
      >;
  transform?: (result: ProSearchTableResult<TRow>) => ProSearchTableResult<TRow> | Promise<ProSearchTableResult<TRow>>;
  afterQuery?: (
    result: ProSearchTableResult<TRow>,
    payload: Pick<
      ProQueryPayload<TForm, TQuery>,
      'pagination' | 'formValues' | 'queryValues' | 'sortState'
    >
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

export type SearchDateRangeField = SearchFieldBase & {
  type: 'dateRange';
  defaultValue?: [string, string];
  dateRangePickerProps?: {
    allowClear?: boolean;
    format?: string;
  };
  toQuery?: (
    value: [string, string] | undefined,
    formValues: SearchFormValues
  ) => SearchQueryValues;
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
  | SearchDateRangeField
  | SearchCascaderField;
export type ProFormSchema = SearchFieldSchema;

export type ProActionIcon =
  | 'archive'
  | 'close'
  | 'eye'
  | 'filter'
  | 'plus'
  | 'refresh'
  | 'reset'
  | 'search'
  | 'sparkles';

export type ProTableColumn<TRow> = {
  key: string;
  title: string;
  dataIndex?: keyof TRow | string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: TRow, index: number) => VNodeChild;
};

type ProActionButtonAppearance = {
  icon?: ProActionIcon;
  type?: ButtonType;
  danger?: boolean;
};

export type ProRowAction<TRow> = ProActionButtonAppearance & {
  key: string;
  label: string;
  onClick: (row: TRow, index: number) => void | Promise<void>;
  visible?: (row: TRow, index: number) => boolean;
  disabled?: (row: TRow, index: number) => boolean;
  loading?: (row: TRow, index: number) => boolean;
  refreshOnSuccess?: boolean;
};

export type ProToolbarAction = ProActionButtonAppearance & {
  key: string;
  label: string;
  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void | Promise<void>;
};

export type ProBulkActionContext<TRow> = {
  selectedRowKeys: Array<string | number>;
  selectedRows: TRow[];
  clearSelection: () => void;
  refresh: () => Promise<void>;
  sortState?: TableSortState;
};

export type ProBulkAction<TRow> = ProActionButtonAppearance & {
  key: string;
  label: string;
  visible?: (context: ProBulkActionContext<TRow>) => boolean;
  disabled?: (context: ProBulkActionContext<TRow>) => boolean;
  loading?: (context: ProBulkActionContext<TRow>) => boolean;
  refreshOnSuccess?: boolean;
  clearSelectionOnSuccess?: boolean;
  onClick: (context: ProBulkActionContext<TRow>) => void | Promise<void>;
};

export type ProRowKey<TRow extends Record<string, unknown> = Record<string, unknown>> = TableRowKey<TRow>;
export type ProRowSelection<TRow extends Record<string, unknown> = Record<string, unknown>> =
  TableRowSelection<TRow>;

import type { CascaderOption } from '@lolita-ui/components-vue';
import type {
  SearchFieldSchema,
  SearchFieldSelectValue,
  SearchFormValues,
  SearchQueryValues
} from './types';

const isCascaderValue = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const resolveDefaultValue = (field: SearchFieldSchema): unknown => {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  if (field.type === 'text') {
    return '';
  }

  return undefined;
};

export const buildDefaultFormValues = (
  schema: SearchFieldSchema[]
): SearchFormValues => {
  return schema.reduce<SearchFormValues>((accumulator, field) => {
    accumulator[field.name] = resolveDefaultValue(field);
    return accumulator;
  }, {});
};

const buildDefaultContribution = (
  field: SearchFieldSchema,
  value: unknown
): SearchQueryValues => ({
  [field.name]: value
});

export const serializeQueryValues = (
  schema: SearchFieldSchema[],
  formValues: SearchFormValues
): { blocked: boolean; queryValues: SearchQueryValues } => {
  const queryValues: SearchQueryValues = {};
  const owners = new Map<string, string>();

  for (const field of schema) {
    const rawValue = formValues[field.name];
    let contribution: SearchQueryValues;

    if (field.toQuery) {
      if (field.type === 'text') {
        contribution = field.toQuery(String(rawValue ?? ''), formValues);
      } else if (field.type === 'select') {
        contribution = field.toQuery(
          rawValue as SearchFieldSelectValue | undefined,
          formValues
        );
      } else if (field.type === 'date') {
        contribution = field.toQuery(
          typeof rawValue === 'string' ? rawValue : undefined,
          formValues
        );
      } else {
        contribution = field.toQuery(
          isCascaderValue(rawValue) ? rawValue : undefined,
          formValues
        );
      }
    } else {
      contribution = buildDefaultContribution(field, rawValue);
    }

    for (const [key, value] of Object.entries(contribution)) {
      const owner = owners.get(key);
      if (owner) {
        console.warn(
          `[ProSearchTable] Duplicate query key "${key}" from "${owner}" and "${field.name}".`
        );
        return {
          blocked: true,
          queryValues: {}
        };
      }

      owners.set(key, field.name);
      queryValues[key] = value;
    }
  }

  return {
    blocked: false,
    queryValues
  };
};

export type { CascaderOption };

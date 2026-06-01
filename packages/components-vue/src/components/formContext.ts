import { inject, type InjectionKey } from 'vue';

export type FormRule = {
  required?: boolean;
  message?: string;
  validator?: (
    value: unknown,
    model: Record<string, unknown>
  ) => void | boolean | string | Promise<void | boolean | string>;
};

export type FormRules = Record<string, FormRule[]>;

export type FieldController = {
  validate: () => Promise<string[]>;
  reset: () => void;
};

export type FormContext = {
  model: Record<string, unknown>;
  rules: FormRules;
  registerField: (name: string, id: symbol, controller: FieldController) => void;
  unregisterField: (name: string, id: symbol) => void;
  validateField: (name: string) => Promise<string[]>;
  getRules: (name: string) => FormRule[];
  getFieldValue: (name: string) => unknown;
  setFieldValue: (name: string, value: unknown) => void;
};

export const formContextKey: InjectionKey<FormContext> = Symbol('lolita-form-context');

export const useFormContext = (): FormContext | undefined => {
  return inject(formContextKey, undefined);
};

export const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
};

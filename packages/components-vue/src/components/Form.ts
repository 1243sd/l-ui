import { defineComponent, h, provide, ref, type PropType } from 'vue';
import { formContextKey, type FieldController, type FormRules } from './formContext';

export type FormSubmitPayload = {
  valid: boolean;
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
};

const cloneModel = (source: Record<string, unknown>): Record<string, unknown> => {
  try {
    return structuredClone(source);
  } catch (_error) {
    return JSON.parse(JSON.stringify(source)) as Record<string, unknown>;
  }
};

export const LForm = defineComponent({
  name: 'LForm',
  inheritAttrs: false,
  props: {
    model: {
      type: Object as PropType<Record<string, unknown>>,
      required: true
    },
    rules: {
      type: Object as PropType<FormRules>,
      default: () => ({})
    }
  },
  emits: {
    submit: (payload: FormSubmitPayload) => payload !== undefined,
    finish: (values: Record<string, unknown>) => values !== undefined,
    finishFailed: (payload: FormSubmitPayload) => payload !== undefined
  },
  setup(props, { attrs, slots, emit, expose }) {
    const fields = new Map<string, Map<symbol, FieldController>>();
    const errors = ref<Record<string, string[]>>({});
    const initialModel = cloneModel(props.model);

    const registerField = (name: string, id: symbol, controller: FieldController): void => {
      const scoped = fields.get(name) ?? new Map<symbol, FieldController>();
      scoped.set(id, controller);
      fields.set(name, scoped);
    };

    const unregisterField = (name: string, id: symbol): void => {
      const scoped = fields.get(name);
      if (!scoped) {
        return;
      }
      scoped.delete(id);
      if (scoped.size === 0) {
        fields.delete(name);
      }
    };

    const validateField = async (name: string): Promise<string[]> => {
      const scoped = fields.get(name);
      if (!scoped || scoped.size === 0) {
        return [];
      }

      const results = await Promise.all(
        Array.from(scoped.values()).map(async (controller) => controller.validate())
      );

      return results.flat();
    };

    const validate = async (): Promise<boolean> => {
      const nextErrors: Record<string, string[]> = {};
      for (const name of fields.keys()) {
        const messages = await validateField(name);
        if (messages.length > 0) {
          nextErrors[name] = messages;
        }
      }

      errors.value = nextErrors;
      return Object.keys(nextErrors).length === 0;
    };

    const resetFields = (): void => {
      Object.keys(props.model).forEach((key) => {
        if (key in initialModel) {
          props.model[key] = initialModel[key];
        } else {
          delete props.model[key];
        }
      });

      Object.keys(initialModel).forEach((key) => {
        if (!(key in props.model)) {
          props.model[key] = initialModel[key];
        }
      });

      fields.forEach((scoped) => {
        scoped.forEach((controller) => controller.reset());
      });
      errors.value = {};
    };

    const buildPayload = (valid: boolean): FormSubmitPayload => ({
      valid,
      values: cloneModel(props.model),
      errors: cloneModel(errors.value) as Record<string, string[]>
    });

    const onSubmit = async (event: Event): Promise<void> => {
      event.preventDefault();
      const valid = await validate();
      const payload = buildPayload(valid);
      emit('submit', payload);
      if (valid) {
        emit('finish', payload.values);
      } else {
        emit('finishFailed', payload);
      }
    };

    provide(formContextKey, {
      model: props.model,
      rules: props.rules,
      registerField,
      unregisterField,
      validateField,
      getRules: (name: string) => props.rules[name] ?? [],
      getFieldValue: (name: string) => props.model[name],
      setFieldValue: (name: string, value: unknown) => {
        props.model[name] = value;
      }
    });

    expose({
      validate,
      resetFields,
      getErrors: () => errors.value
    });

    return () =>
      h(
        'form',
        {
          ...attrs,
          class: ['l-form', attrs.class],
          style: attrs.style,
          onSubmit
        },
        slots.default?.()
      );
  }
});

export const Form = LForm;

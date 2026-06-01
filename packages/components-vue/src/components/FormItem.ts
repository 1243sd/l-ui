import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  onBeforeUnmount,
  ref,
  watch,
  type PropType,
  type VNode
} from 'vue';
import { classNames } from '../utils/classNames';
import { isEmptyValue, useFormContext, type FormRule } from './formContext';

const callHandler = (handler: unknown, ...args: unknown[]): void => {
  if (typeof handler === 'function') {
    (handler as (...handlerArgs: unknown[]) => void)(...args);
    return;
  }

  if (Array.isArray(handler)) {
    handler.forEach((item) => callHandler(item, ...args));
  }
};

const validateByRule = async (
  rule: FormRule,
  value: unknown,
  model: Record<string, unknown>
): Promise<string | null> => {
  if (rule.required && isEmptyValue(value)) {
    return rule.message ?? 'This field is required.';
  }

  if (!rule.validator) {
    return null;
  }

  const result = await rule.validator(value, model);
  if (result === false) {
    return rule.message ?? 'Validation failed.';
  }
  if (typeof result === 'string' && result.length > 0) {
    return result;
  }
  return null;
};

export const LFormItem = defineComponent({
  name: 'LFormItem',
  props: {
    name: {
      type: String,
      default: undefined
    },
    label: {
      type: String,
      default: undefined
    },
    required: {
      type: Boolean,
      default: false
    },
    help: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    valuePropName: {
      type: String as PropType<'value' | 'checked'>,
      default: 'value'
    }
  },
  setup(props, { attrs, slots }) {
    const form = useFormContext();
    const errorMessage = ref('');
    const fieldId = Symbol('form-item');
    const initialValue = ref<unknown>(undefined);

    const currentRules = computed<FormRule[]>(() => {
      if (!form || !props.name) {
        return [];
      }
      const rules = form.getRules(props.name);
      if (!props.required) {
        return rules;
      }

      return [
        {
          required: true,
          message: props.help ?? `${props.label ?? props.name} is required.`
        },
        ...rules
      ];
    });

    const runValidation = async (): Promise<string[]> => {
      if (!form || !props.name) {
        return [];
      }

      const value = form.getFieldValue(props.name);
      const messages: string[] = [];
      for (const rule of currentRules.value) {
        const normalizedValue =
          props.valuePropName === 'checked' && rule.required ? (value === true ? true : undefined) : value;
        const message = await validateByRule(rule, normalizedValue, form.model);
        if (message) {
          messages.push(message);
          break;
        }
      }

      errorMessage.value = messages[0] ?? '';
      return messages;
    };

    const registerField = (name: string): void => {
      initialValue.value = form?.getFieldValue(name);
      form?.registerField(name, fieldId, {
        validate: runValidation,
        reset: () => {
          form?.setFieldValue(name, initialValue.value);
          errorMessage.value = '';
        }
      });
    };

    watch(
      () => props.name,
      (nextName, previousName) => {
        if (!form) {
          return;
        }

        if (previousName) {
          form.unregisterField(previousName, fieldId);
        }

        if (nextName) {
          registerField(nextName);
        }
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      if (!form || !props.name) {
        return;
      }
      form.unregisterField(props.name, fieldId);
    });

    const mergedHelp = computed(() => errorMessage.value || props.help || '');
    const wrapperClass = computed(() =>
      classNames('l-form-item', errorMessage.value && 'l-form-item--error')
    );

    const wrapField = (): VNode[] => {
      const nodes = slots.default?.() ?? [];
      if (!form || !props.name) {
        return nodes as VNode[];
      }

      const firstIndex = nodes.findIndex((node) => isVNode(node));
      if (firstIndex < 0) {
        return nodes as VNode[];
      }

      const current = nodes[firstIndex] as VNode;
      const currentProps = (current.props ?? {}) as Record<string, unknown>;
      const updateKey = `onUpdate:${props.valuePropName}`;
      const clonedProps: Record<string, unknown> = {
        [props.valuePropName]: form.getFieldValue(props.name),
        [updateKey]: (nextValue: unknown) => {
          form.setFieldValue(props.name!, nextValue);
          errorMessage.value = '';
          callHandler(currentProps[updateKey], nextValue);
        },
        onBlur: async (event: FocusEvent) => {
          await runValidation();
          callHandler(currentProps.onBlur, event);
        }
      };

      if (errorMessage.value) {
        clonedProps.status = 'error';
      }

      const next = cloneVNode(current, clonedProps);

      const copied = [...nodes];
      copied[firstIndex] = next;
      return copied as VNode[];
    };

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: [wrapperClass.value, attrs.class],
          style: attrs.style
        },
        [
          props.label
            ? h('label', { class: 'l-form-item__label' }, [
                props.required ? h('span', { class: 'l-form-item__required' }, '*') : null,
                h('span', props.label)
              ])
            : null,
          h('div', { class: 'l-form-item__control' }, wrapField()),
          mergedHelp.value
            ? h(
                'div',
                {
                  class: classNames(
                    'l-form-item__help',
                    errorMessage.value && 'l-form-item__help--error'
                  )
                },
                mergedHelp.value
              )
            : null
        ]
      );
  }
});

export const FormItem = LFormItem;

import {
  cloneVNode,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  isVNode,
  provide,
  ref,
  type PropType,
  type VNode
} from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';
import type { InputStatus } from './Input';
import { LRadio, radioGroupContextKey, type RadioValue } from './Radio';

export type RadioOption = {
  label: string;
  value: RadioValue;
  disabled?: boolean;
};

export const LRadioGroup = defineComponent({
  name: 'LRadioGroup',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Boolean] as PropType<RadioValue | undefined>,
      default: undefined
    },
    defaultValue: {
      type: [String, Number, Boolean] as PropType<RadioValue | undefined>,
      default: undefined
    },
    options: {
      type: Array as PropType<RadioOption[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: undefined
    },
    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    }
  },
  emits: {
    'update:value': (value: RadioValue | undefined) =>
      value === undefined || ['string', 'number', 'boolean'].includes(typeof value),
    change: (value: RadioValue | undefined, event: Event) =>
      (value === undefined || ['string', 'number', 'boolean'].includes(typeof value)) &&
      event instanceof Event
  },
  setup(props, { attrs, emit, slots }) {
    const config = useLolitaConfig();
    const instance = getCurrentInstance();
    const isControlled = computed(() => {
      const vnodeProps = instance?.vnode.props ?? {};
      return 'value' in vnodeProps || 'onUpdate:value' in vnodeProps;
    });
    const internalValue = ref<RadioValue | undefined>(props.defaultValue);
    const mergedValue = computed<RadioValue | undefined>(() =>
      isControlled.value ? props.value : internalValue.value
    );
    const prefixedClass = computed(() => `${config.value.prefixCls}-radio-group`);

    const updateValue = (nextValue: RadioValue, event: Event): void => {
      if (props.disabled) {
        return;
      }

      if (!isControlled.value) {
        internalValue.value = nextValue;
      }

      emit('update:value', nextValue);
      emit('change', nextValue, event);
    };

    provide(radioGroupContextKey, {
      value: mergedValue,
      disabled: computed(() => props.disabled),
      name: computed(() => props.name),
      status: computed(() => props.status),
      select: updateValue
    });

    const className = computed(() =>
      classNames(
        'l-radio-group',
        props.disabled && 'l-radio-group--disabled',
        props.status === 'error' && 'l-radio-group--error',
        props.status === 'warning' && 'l-radio-group--warning',
        prefixedClass.value !== 'l-radio-group' && prefixedClass.value
      )
    );

    const renderOptions = (): VNode[] =>
      props.options.map((option) =>
        h(
          LRadio,
          {
            key: String(option.value),
            value: option.value,
            disabled: option.disabled
          },
          () => option.label
        )
      );

    const renderChildren = (): VNode[] => {
      if (props.options.length > 0) {
        return renderOptions();
      }

      return (slots.default?.() ?? []).map((node) => {
        if (!isVNode(node)) {
          return node;
        }

        return cloneVNode(node, {
          name: props.name
        });
      }) as VNode[];
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...groupAttrs } = attrs;

      return h(
        'div',
        {
          ...groupAttrs,
          class: [className.value, attrsClass],
          style: attrsStyle,
          role: 'radiogroup',
          'aria-disabled': props.disabled ? 'true' : 'false'
        },
        renderChildren()
      );
    };
  }
});

export const RadioGroup = LRadioGroup;

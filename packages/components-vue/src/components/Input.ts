import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { useLolitaConfig, type ComponentSize } from '../config/context';
import { classNames } from '../utils/classNames';

export type InputStatus = 'default' | 'error' | 'warning';

export const LInput = defineComponent({
  name: 'LInput',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined
    },
    defaultValue: {
      type: [String, Number] as PropType<string | number>,
      default: ''
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: undefined
    },
    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    allowClear: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: undefined
    }
  },
  emits: {
    'update:value': (value: string) => typeof value === 'string',
    change: (value: string, event: Event) => typeof value === 'string' && event instanceof Event,
    focus: (event: FocusEvent) => event instanceof FocusEvent,
    blur: (event: FocusEvent) => event instanceof FocusEvent
  },
  setup(props, { attrs, emit }) {
    const config = useLolitaConfig();
    const isControlled = computed(() => props.value !== undefined);
    const internalValue = ref(String(props.defaultValue ?? ''));
    const mergedSize = computed<ComponentSize>(() => props.size ?? config.value.componentSize);
    const prefixedInputClass = computed(() => `${config.value.prefixCls}-input`);
    const prefixedWrapperClass = computed(() => `${config.value.prefixCls}-input-wrapper`);

    const mergedValue = computed(() =>
      isControlled.value ? String(props.value ?? '') : internalValue.value
    );
    const showClear = computed(() => props.allowClear && !props.disabled && mergedValue.value.length > 0);

    const className = computed(() =>
      classNames(
        'l-input-wrapper',
        `l-input-wrapper--${mergedSize.value}`,
        showClear.value && 'l-input-wrapper--clearable',
        props.status !== 'default' && `l-input-wrapper--${props.status}`,
        props.disabled && 'l-input-wrapper--disabled',
        prefixedWrapperClass.value !== 'l-input-wrapper' && prefixedWrapperClass.value
      )
    );

    const emitChange = (nextValue: string, event: Event) => {
      emit('update:value', nextValue);
      emit('change', nextValue, event);
    };

    const updateValue = (nextValue: string, event: Event) => {
      if (!isControlled.value) {
        internalValue.value = nextValue;
      }
      emitChange(nextValue, event);
    };

    const onInput = (event: Event) => {
      if (props.disabled) {
        event.preventDefault();
        return;
      }
      const target = event.target as HTMLInputElement | null;
      updateValue(target?.value ?? '', event);
    };

    const onClearMouseDown = (event: MouseEvent) => {
      event.preventDefault();
    };

    const onClearClick = (event: MouseEvent) => {
      if (props.disabled) {
        return;
      }
      updateValue('', event);
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...inputAttrs } = attrs;

      return h(
        'span',
        {
          class: [className.value, attrsClass],
          style: attrsStyle
        },
        [
          h('input', {
            ...inputAttrs,
            class: classNames('l-input', prefixedInputClass.value !== 'l-input' && prefixedInputClass.value),
            value: mergedValue.value,
            placeholder: props.placeholder,
            disabled: props.disabled,
            onInput,
            onFocus: (event: FocusEvent) => emit('focus', event),
            onBlur: (event: FocusEvent) => emit('blur', event)
          }),
          showClear.value
            ? h(
                'button',
                {
                  type: 'button',
                  class: ['l-input__clear', 'l-field-affix-action'],
                  'aria-label': 'Clear input',
                  tabIndex: -1,
                  onMousedown: onClearMouseDown,
                  onClick: onClearClick
                },
                '×'
              )
            : null
        ]
      );
    };
  }
});

export const Input = LInput;

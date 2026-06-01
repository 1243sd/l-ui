import { computed, defineComponent, h, inject, ref, type InjectionKey, type PropType } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';
import type { InputStatus } from './Input';

export type RadioValue = string | number | boolean;

export type RadioGroupContext = {
  value: Readonly<{ value: RadioValue | undefined }>;
  disabled: Readonly<{ value: boolean }>;
  name: Readonly<{ value: string | undefined }>;
  status: Readonly<{ value: InputStatus }>;
  select: (value: RadioValue, event: Event) => void;
};

export const radioGroupContextKey: InjectionKey<RadioGroupContext> = Symbol('lolita-radio-group');

export const LRadio = defineComponent({
  name: 'LRadio',
  inheritAttrs: false,
  props: {
    checked: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    defaultChecked: {
      type: Boolean,
      default: false
    },
    value: {
      type: [String, Number, Boolean] as PropType<RadioValue | undefined>,
      default: undefined
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
    'update:checked': (checked: boolean) => typeof checked === 'boolean',
    change: (checked: boolean, event: Event) => typeof checked === 'boolean' && event instanceof Event
  },
  setup(props, { attrs, emit, slots }) {
    const config = useLolitaConfig();
    const group = inject(radioGroupContextKey, undefined);
    const isControlled = computed(() => props.checked !== undefined);
    const internalChecked = ref(Boolean(props.defaultChecked));
    const mergedDisabled = computed(() => props.disabled || group?.disabled.value === true);
    const mergedName = computed(() => group?.name.value ?? props.name);
    const mergedStatus = computed(() => group?.status.value ?? props.status);
    const mergedChecked = computed(() => {
      if (group) {
        return group.value.value === props.value;
      }
      return isControlled.value ? Boolean(props.checked) : internalChecked.value;
    });
    const prefixedClass = computed(() => `${config.value.prefixCls}-radio`);

    const className = computed(() =>
      classNames(
        'l-radio',
        mergedChecked.value && 'l-radio--checked',
        mergedDisabled.value && 'l-radio--disabled',
        mergedStatus.value === 'error' && 'l-radio--error',
        mergedStatus.value === 'warning' && 'l-radio--warning',
        prefixedClass.value !== 'l-radio' && prefixedClass.value
      )
    );

    const updateChecked = (nextChecked: boolean, event: Event): void => {
      if (group) {
        if (nextChecked && props.value !== undefined) {
          group.select(props.value, event);
        }
        const target = event.target as HTMLInputElement | null;
        if (target) {
          target.checked = group.value.value === props.value;
        }
        return;
      }

      if (!isControlled.value) {
        internalChecked.value = nextChecked;
      }
      emit('update:checked', nextChecked);
      emit('change', nextChecked, event);
    };

    const onChange = (event: Event): void => {
      if (mergedDisabled.value) {
        event.preventDefault();
        return;
      }

      const target = event.target as HTMLInputElement | null;
      updateChecked(Boolean(target?.checked), event);
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...inputAttrs } = attrs;

      return h(
        'label',
        {
          class: [className.value, attrsClass],
          style: attrsStyle
        },
        [
          h('span', { class: 'l-radio__control' }, [
            h('input', {
              ...inputAttrs,
              class: 'l-radio__input',
              type: 'radio',
              checked: mergedChecked.value,
              disabled: mergedDisabled.value,
              name: mergedName.value,
              value: props.value as string | number | boolean | undefined,
              onChange
            }),
            h('span', { class: 'l-radio__indicator', 'aria-hidden': 'true' })
          ]),
          slots.default ? h('span', { class: 'l-radio__label' }, slots.default()) : null
        ]
      );
    };
  }
});

export const Radio = LRadio;

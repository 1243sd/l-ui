import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';
import type { InputStatus } from './Input';

export const LSwitch = defineComponent({
  name: 'LSwitch',
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
    disabled: {
      type: Boolean,
      default: false
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
  setup(props, { attrs, emit }) {
    const config = useLolitaConfig();
    const isControlled = computed(() => props.checked !== undefined);
    const internalChecked = ref(Boolean(props.defaultChecked));
    const mergedChecked = computed(() =>
      isControlled.value ? Boolean(props.checked) : internalChecked.value
    );
    const prefixedClass = computed(() => `${config.value.prefixCls}-switch`);

    const className = computed(() =>
      classNames(
        'l-switch',
        mergedChecked.value && 'l-switch--checked',
        props.disabled && 'l-switch--disabled',
        props.status === 'error' && 'l-switch--error',
        props.status === 'warning' && 'l-switch--warning',
        prefixedClass.value !== 'l-switch' && prefixedClass.value
      )
    );

    const updateChecked = (nextChecked: boolean, event: Event): void => {
      if (!isControlled.value) {
        internalChecked.value = nextChecked;
      }
      emit('update:checked', nextChecked);
      emit('change', nextChecked, event);
    };

    const onClick = (event: MouseEvent): void => {
      if (props.disabled) {
        event.preventDefault();
        return;
      }

      updateChecked(!mergedChecked.value, event);
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...buttonAttrs } = attrs;

      return h(
        'span',
        {
          class: [className.value, attrsClass],
          style: attrsStyle
        },
        [
          h(
            'button',
            {
              ...buttonAttrs,
              type: 'button',
              class: 'l-switch__button',
              role: 'switch',
              'aria-checked': mergedChecked.value ? 'true' : 'false',
              disabled: props.disabled,
              onClick
            },
            [h('span', { class: 'l-switch__handle', 'aria-hidden': 'true' })]
          )
        ]
      );
    };
  }
});

export const Switch = LSwitch;

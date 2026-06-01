import { computed, defineComponent, h, onMounted, ref, watch, type PropType } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';
import type { InputStatus } from './Input';

export const LCheckbox = defineComponent({
  name: 'LCheckbox',
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
    indeterminate: {
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
  setup(props, { attrs, emit, slots }) {
    const config = useLolitaConfig();
    const inputRef = ref<HTMLInputElement | null>(null);
    const isControlled = computed(() => props.checked !== undefined);
    const internalChecked = ref(Boolean(props.defaultChecked));
    const mergedChecked = computed(() =>
      isControlled.value ? Boolean(props.checked) : internalChecked.value
    );
    const prefixedClass = computed(() => `${config.value.prefixCls}-checkbox`);

    const syncIndeterminate = (): void => {
      if (inputRef.value) {
        inputRef.value.indeterminate = props.indeterminate;
      }
    };

    onMounted(syncIndeterminate);
    watch(() => props.indeterminate, syncIndeterminate);

    const className = computed(() =>
      classNames(
        'l-checkbox',
        mergedChecked.value && 'l-checkbox--checked',
        props.indeterminate && 'l-checkbox--indeterminate',
        props.disabled && 'l-checkbox--disabled',
        props.status === 'error' && 'l-checkbox--error',
        props.status === 'warning' && 'l-checkbox--warning',
        prefixedClass.value !== 'l-checkbox' && prefixedClass.value
      )
    );

    const updateChecked = (nextChecked: boolean, event: Event): void => {
      if (!isControlled.value) {
        internalChecked.value = nextChecked;
      }
      emit('update:checked', nextChecked);
      emit('change', nextChecked, event);
    };

    const onChange = (event: Event): void => {
      if (props.disabled) {
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
          h('span', { class: 'l-checkbox__control' }, [
            h('input', {
              ...inputAttrs,
              ref: inputRef,
              class: 'l-checkbox__input',
              type: 'checkbox',
              checked: mergedChecked.value,
              disabled: props.disabled,
              onChange
            }),
            h('span', { class: 'l-checkbox__indicator', 'aria-hidden': 'true' })
          ]),
          slots.default ? h('span', { class: 'l-checkbox__label' }, slots.default()) : null
        ]
      );
    };
  }
});

export const Checkbox = LCheckbox;

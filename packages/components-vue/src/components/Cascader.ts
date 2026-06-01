import { computed, defineComponent, h, ref, watch, type PropType } from 'vue';
import { useLolitaConfig, type ComponentSize } from '../config/context';
import { classNames } from '../utils/classNames';
import type { InputStatus } from './Input';

export type CascaderOption = {
  value: string;
  label: string;
  disabled?: boolean;
  children?: CascaderOption[];
};

const normalizePath = (value: string[] | undefined): string[] => (Array.isArray(value) ? value : []);

const findOptionsAtPath = (options: CascaderOption[], path: string[]): CascaderOption[] => {
  let currentOptions = options;

  for (const segment of path) {
    const currentOption = currentOptions.find((option) => option.value === segment);
    if (!currentOption?.children?.length) {
      return currentOptions;
    }

    currentOptions = currentOption.children;
  }

  return currentOptions;
};

const findLabelsForPath = (options: CascaderOption[], path: string[]): string[] => {
  const labels: string[] = [];
  let currentOptions = options;

  for (const segment of path) {
    const currentOption = currentOptions.find((option) => option.value === segment);
    if (!currentOption) {
      break;
    }

    labels.push(currentOption.label);
    currentOptions = currentOption.children ?? [];
  }

  return labels;
};

const buildColumns = (options: CascaderOption[], path: string[]): CascaderOption[][] => {
  const columns: CascaderOption[][] = [options];
  let currentOptions = options;

  for (const segment of path) {
    const currentOption = currentOptions.find((option) => option.value === segment);
    if (!currentOption?.children?.length) {
      break;
    }

    columns.push(currentOption.children);
    currentOptions = currentOption.children;
  }

  return columns;
};

export const LCascader = defineComponent({
  name: 'LCascader',
  inheritAttrs: false,
  props: {
    value: {
      type: Array as PropType<string[] | undefined>,
      default: undefined
    },
    defaultValue: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    options: {
      type: Array as PropType<CascaderOption[]>,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Select option'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    allowClear: {
      type: Boolean,
      default: false
    },
    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: undefined
    }
  },
  emits: {
    'update:value': (value: string[] | undefined) =>
      value === undefined || (Array.isArray(value) && value.every((item) => typeof item === 'string')),
    change: (value: string[] | undefined) =>
      value === undefined || (Array.isArray(value) && value.every((item) => typeof item === 'string')),
    openChange: (open: boolean) => typeof open === 'boolean',
    focus: (event: FocusEvent) => event instanceof FocusEvent,
    blur: (event: FocusEvent) => event instanceof FocusEvent
  },
  setup(props, { attrs, emit }) {
    const config = useLolitaConfig();
    const isControlled = computed(() => props.value !== undefined);
    const internalValue = ref<string[]>(props.defaultValue);
    const open = ref(false);
    const hasFocusWithin = ref(false);
    const wrapperRef = ref<HTMLElement | null>(null);
    const activePath = ref<string[]>(normalizePath(props.defaultValue));

    const mergedValue = computed<string[]>(() =>
      isControlled.value ? normalizePath(props.value) : internalValue.value
    );
    const mergedSize = computed<ComponentSize>(() => props.size ?? config.value.componentSize);
    const selectedLabels = computed(() => findLabelsForPath(props.options, mergedValue.value));
    const columns = computed(() => buildColumns(props.options, activePath.value));
    const showClear = computed(
      () => props.allowClear && !props.disabled && mergedValue.value.length > 0
    );

    watch(
      mergedValue,
      (nextValue) => {
        if (!open.value) {
          activePath.value = [...nextValue];
        }
      },
      { immediate: true }
    );

    const wrapperClassName = computed(() =>
      classNames(
        'l-cascader-wrapper',
        `l-cascader-wrapper--${mergedSize.value}`,
        props.status !== 'default' && `l-cascader-wrapper--${props.status}`,
        props.disabled && 'l-cascader-wrapper--disabled',
        showClear.value && 'l-cascader-wrapper--clearable',
        open.value && 'l-cascader-wrapper--open'
      )
    );

    const setOpen = (nextOpen: boolean): void => {
      if (open.value === nextOpen) {
        return;
      }

      open.value = nextOpen;
      emit('openChange', nextOpen);
    };

    const updateValue = (nextValue: string[] | undefined): void => {
      if (!isControlled.value) {
        internalValue.value = nextValue ?? [];
      }

      emit('update:value', nextValue);
      emit('change', nextValue);
    };

    const toggleOpen = (): void => {
      if (props.disabled) {
        return;
      }

      if (!open.value) {
        activePath.value = [...mergedValue.value];
      }

      setOpen(!open.value);
    };

    const closeDropdown = (): void => {
      setOpen(false);
    };

    const onWrapperFocusIn = (event: FocusEvent): void => {
      if (hasFocusWithin.value) {
        return;
      }

      hasFocusWithin.value = true;
      emit('focus', event);
    };

    const onWrapperFocusOut = (event: FocusEvent): void => {
      const nextTarget = event.relatedTarget as Node | null;
      if (wrapperRef.value?.contains(nextTarget)) {
        return;
      }

      hasFocusWithin.value = false;
      closeDropdown();
      emit('blur', event);
    };

    const onClearMouseDown = (event: MouseEvent): void => {
      event.preventDefault();
    };

    const onClearClick = (event: MouseEvent): void => {
      event.stopPropagation();
      if (props.disabled) {
        return;
      }

      activePath.value = [];
      updateValue(undefined);
      closeDropdown();
    };

    const onSelectOption = (level: number, option: CascaderOption): void => {
      if (props.disabled || option.disabled) {
        return;
      }

      const nextPath = [...activePath.value.slice(0, level), option.value];
      activePath.value = nextPath;

      if (option.children?.length) {
        return;
      }

      updateValue(nextPath);
      closeDropdown();
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...triggerAttrs } = attrs;

      return h(
        'div',
        {
          ref: wrapperRef,
          class: [wrapperClassName.value, attrsClass],
          style: attrsStyle,
          onFocusin: onWrapperFocusIn,
          onFocusout: onWrapperFocusOut
        },
        [
          h(
            'button',
            {
              ...triggerAttrs,
              type: 'button',
              class: 'l-cascader',
              disabled: props.disabled,
              tabIndex: props.disabled ? -1 : 0,
              'aria-haspopup': 'listbox',
              'aria-expanded': open.value,
              onClick: toggleOpen
            },
            [
              h(
                'span',
                {
                  class: classNames(
                    'l-cascader__value',
                    selectedLabels.value.length === 0 && 'l-cascader__value--placeholder'
                  )
                },
                selectedLabels.value.length > 0
                  ? selectedLabels.value.join(' / ')
                  : props.placeholder
              ),
              h('span', { class: 'l-cascader__indicator', 'aria-hidden': 'true' }, [
                h('span', { class: 'l-cascader__arrow' })
              ])
            ]
          ),
          showClear.value
            ? h(
                'button',
                {
                  type: 'button',
                  class: ['l-cascader__clear', 'l-field-affix-action'],
                  tabIndex: -1,
                  'aria-label': 'Clear selection',
                  onMousedown: onClearMouseDown,
                  onClick: onClearClick
                },
                '×'
              )
            : null,
          open.value
            ? h(
                'div',
                {
                  class: 'l-cascader-dropdown'
                },
                columns.value.map((column, level) =>
                  h(
                    'div',
                    {
                      key: `column-${level}`,
                      class: 'l-cascader-dropdown__column'
                    },
                    column.map((option) =>
                      h(
                        'button',
                        {
                          key: option.value,
                          type: 'button',
                          class: classNames(
                            'l-cascader-option',
                            activePath.value[level] === option.value &&
                              'l-cascader-option--selected',
                            option.disabled && 'l-cascader-option--disabled'
                          ),
                          'data-cascader-option': option.value,
                          disabled: option.disabled,
                          onClick: () => onSelectOption(level, option)
                        },
                        [
                          h('span', { class: 'l-cascader-option__label' }, option.label),
                          option.children?.length
                            ? h('span', { class: 'l-cascader-option__suffix' }, '›')
                            : null
                        ]
                      )
                    )
                  )
                )
              )
            : null
        ]
      );
    };
  }
});

export const Cascader = LCascader;

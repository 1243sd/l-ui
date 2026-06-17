import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  ref,
  watch,
  type PropType
} from 'vue';
import { useLolitaConfig, type ComponentSize } from '../config/context';
import { classNames } from '../utils/classNames';
import type { InputStatus } from './Input';

export type SelectValue = string | number | boolean;
export type SelectMode = 'multiple';
export type SelectModelValue = SelectValue | SelectValue[] | undefined;
export type SelectOption = {
  label: string;
  value: SelectValue;
  disabled?: boolean;
};
export type SelectFilterOption =
  | boolean
  | ((inputValue: string, option: SelectOption) => boolean);

const isOptionDisabled = (option: SelectOption | undefined): boolean => option?.disabled === true;

const findFirstEnabledIndex = (options: SelectOption[]): number =>
  options.findIndex((option) => !isOptionDisabled(option));

const normalizeSelectedValues = (
  value: SelectModelValue,
  multiple: boolean
): SelectValue[] => {
  if (multiple) {
    if (Array.isArray(value)) {
      return value;
    }
    return value === undefined ? [] : [value];
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? [value[0]] : [];
  }

  return value === undefined ? [] : [value];
};

const resolveInitialActiveIndex = (
  options: SelectOption[],
  selectedValues: SelectValue[]
): number => {
  if (options.length === 0) {
    return -1;
  }

  const selectedIndex = options.findIndex(
    (option) => selectedValues.includes(option.value) && !isOptionDisabled(option)
  );
  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return findFirstEnabledIndex(options);
};

const moveActiveIndex = (currentIndex: number, direction: 1 | -1, options: SelectOption[]): number => {
  if (options.length === 0) {
    return -1;
  }

  let nextIndex = currentIndex;
  for (let step = 0; step < options.length; step += 1) {
    nextIndex =
      nextIndex < 0
        ? direction > 0
          ? 0
          : options.length - 1
        : (nextIndex + direction + options.length) % options.length;

    if (!isOptionDisabled(options[nextIndex])) {
      return nextIndex;
    }
  }

  return -1;
};

export const LSelect = defineComponent({
  name: 'LSelect',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Boolean, Array] as PropType<SelectModelValue>,
      default: undefined
    },
    defaultValue: {
      type: [String, Number, Boolean, Array] as PropType<SelectModelValue>,
      default: undefined
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    allowClear: {
      type: Boolean,
      default: false
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: undefined
    },
    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    },
    mode: {
      type: String as PropType<SelectMode | undefined>,
      default: undefined
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    searchValue: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    defaultSearchValue: {
      type: String,
      default: ''
    },
    filterOption: {
      type: [Boolean, Function] as PropType<SelectFilterOption>,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    notFoundContent: {
      type: String,
      default: '暂无数据'
    }
  },
  emits: {
    'update:value': (value: SelectModelValue) =>
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      (Array.isArray(value) &&
        value.every(
          (item) =>
            typeof item === 'string' ||
            typeof item === 'number' ||
            typeof item === 'boolean'
        )),
    change: (value: SelectModelValue) =>
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      (Array.isArray(value) &&
        value.every(
          (item) =>
            typeof item === 'string' ||
            typeof item === 'number' ||
            typeof item === 'boolean'
        )),
    'update:searchValue': (value: string) => typeof value === 'string',
    search: (value: string) => typeof value === 'string',
    focus: (event: FocusEvent) => event instanceof FocusEvent,
    blur: (event: FocusEvent) => event instanceof FocusEvent
  },
  setup(props, { attrs, emit }) {
    const config = useLolitaConfig();
    const instance = getCurrentInstance();
    const isControlled = computed(() =>
      Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'value')
    );
    const isSearchControlled = computed(() =>
      Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'searchValue')
    );
    const isMultiple = computed(() => props.mode === 'multiple');
    const internalValue = ref<SelectModelValue>(props.defaultValue);
    const internalSearchValue = ref(props.defaultSearchValue);
    const open = ref(false);
    const activeIndex = ref(-1);
    const wrapperRef = ref<HTMLElement | null>(null);
    const searchInputRef = ref<HTMLInputElement | null>(null);
    const hasFocusWithin = ref(false);

    const mergedValue = computed<SelectModelValue>(() =>
      isControlled.value ? props.value : internalValue.value
    );
    const mergedSearchValue = computed<string>(() =>
      isSearchControlled.value ? props.searchValue ?? '' : internalSearchValue.value
    );
    const mergedSize = computed<ComponentSize>(() => props.size ?? config.value.componentSize);
    const mergedSelectedValues = computed<SelectValue[]>(() =>
      normalizeSelectedValues(mergedValue.value, isMultiple.value)
    );
    const selectedOptions = computed(() =>
      props.options.filter((option) => mergedSelectedValues.value.includes(option.value))
    );
    const singleSelectedOption = computed(() => selectedOptions.value[0]);
    const showClear = computed(() => {
      if (!props.allowClear || props.disabled) {
        return false;
      }

      return isMultiple.value
        ? mergedSelectedValues.value.length > 0
        : mergedSelectedValues.value.length > 0;
    });
    const prefixedWrapperClass = computed(() => `${config.value.prefixCls}-select-wrapper`);
    const prefixedTriggerClass = computed(() => `${config.value.prefixCls}-select`);

    const filteredOptions = computed<SelectOption[]>(() => {
      if (!props.showSearch) {
        return props.options;
      }

      const keyword = mergedSearchValue.value.trim();
      if (keyword.length === 0) {
        return props.options;
      }

      if (props.filterOption === false) {
        return props.options;
      }

      const filterFn = props.filterOption;
      if (typeof filterFn === 'function') {
        return props.options.filter((option) => filterFn(keyword, option));
      }

      const normalizedKeyword = keyword.toLowerCase();
      return props.options.filter((option) =>
        String(option.label).toLowerCase().includes(normalizedKeyword)
      );
    });

    watch(
      [filteredOptions, mergedSelectedValues, open],
      ([nextOptions, nextSelectedValues, isOpen]) => {
        if (!isOpen) {
          return;
        }

        activeIndex.value = resolveInitialActiveIndex(nextOptions, nextSelectedValues);
      }
    );

    const wrapperClassName = computed(() =>
      classNames(
        'l-select-wrapper',
        `l-select-wrapper--${mergedSize.value}`,
        showClear.value && 'l-select-wrapper--clearable',
        props.status !== 'default' && `l-select-wrapper--${props.status}`,
        props.disabled && 'l-select-wrapper--disabled',
        open.value && 'l-select-wrapper--open',
        prefixedWrapperClass.value !== 'l-select-wrapper' && prefixedWrapperClass.value
      )
    );

    const triggerClassName = computed(() =>
      classNames('l-select', prefixedTriggerClass.value !== 'l-select' && prefixedTriggerClass.value)
    );

    const syncSearchValue = (nextValue: string, emitSearchEvent: boolean): void => {
      if (!isSearchControlled.value) {
        internalSearchValue.value = nextValue;
      }

      emit('update:searchValue', nextValue);
      if (emitSearchEvent) {
        emit('search', nextValue);
      }
    };

    const resetSearchValue = (): void => {
      if (!props.showSearch || mergedSearchValue.value.length === 0) {
        return;
      }
      syncSearchValue('', false);
    };

    const updateValue = (nextValue: SelectModelValue): void => {
      if (!isControlled.value) {
        internalValue.value = nextValue;
      }
      emit('update:value', nextValue);
      emit('change', nextValue);
    };

    const openDropdown = async (): Promise<void> => {
      if (props.disabled) {
        return;
      }

      open.value = true;
      activeIndex.value = resolveInitialActiveIndex(
        filteredOptions.value,
        mergedSelectedValues.value
      );

      if (props.showSearch) {
        await nextTick();
        searchInputRef.value?.focus();
      }
    };

    const closeDropdown = (): void => {
      open.value = false;
      activeIndex.value = -1;
    };

    const toggleDropdown = async (): Promise<void> => {
      if (open.value) {
        closeDropdown();
        return;
      }

      await openDropdown();
    };

    const selectOption = (option: SelectOption): void => {
      if (isOptionDisabled(option)) {
        return;
      }

      if (isMultiple.value) {
        const hasValue = mergedSelectedValues.value.includes(option.value);
        const nextValues = hasValue
          ? mergedSelectedValues.value.filter((item) => item !== option.value)
          : [...mergedSelectedValues.value, option.value];

        updateValue(nextValues);
        resetSearchValue();
        activeIndex.value = resolveInitialActiveIndex(filteredOptions.value, nextValues);
        return;
      }

      updateValue(option.value);
      resetSearchValue();
      closeDropdown();
    };

    const selectByIndex = (index: number): void => {
      const option = filteredOptions.value[index];
      if (!option) {
        return;
      }

      selectOption(option);
    };

    const onKeydown = async (event: KeyboardEvent): Promise<void> => {
      if (props.disabled) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open.value) {
          await openDropdown();
          return;
        }

        const direction = event.key === 'ArrowDown' ? 1 : -1;
        activeIndex.value = moveActiveIndex(
          activeIndex.value,
          direction,
          filteredOptions.value
        );
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (!open.value) {
          await openDropdown();
          return;
        }

        if (activeIndex.value >= 0) {
          selectByIndex(activeIndex.value);
        }
        return;
      }

      if (event.key === 'Escape' && open.value) {
        event.preventDefault();
        closeDropdown();
        return;
      }

      if (
        event.key === 'Backspace' &&
        isMultiple.value &&
        mergedSearchValue.value.length === 0 &&
        mergedSelectedValues.value.length > 0
      ) {
        updateValue(mergedSelectedValues.value.slice(0, -1));
      }
    };

    const onSearchInput = (event: Event): void => {
      const target = event.target as HTMLInputElement | null;
      syncSearchValue(target?.value ?? '', true);
      activeIndex.value = resolveInitialActiveIndex(filteredOptions.value, mergedSelectedValues.value);
    };

    const onClearMouseDown = (event: MouseEvent): void => {
      event.preventDefault();
    };

    const onClearClick = (event: MouseEvent): void => {
      event.stopPropagation();
      if (props.disabled) {
        return;
      }

      updateValue(isMultiple.value ? [] : undefined);
      resetSearchValue();
      closeDropdown();
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

    const renderSelectionContent = () => {
      if (isMultiple.value) {
        if (selectedOptions.value.length === 0) {
          return h(
            'span',
            {
              class: classNames('l-select__value', 'l-select__value--placeholder')
            },
            props.placeholder
          );
        }

        return h(
          'span',
          {
            class: 'l-select__tags'
          },
          selectedOptions.value.map((option) =>
            h(
              'span',
              {
                key: String(option.value),
                class: 'l-select__tag'
              },
              option.label
            )
          )
        );
      }

      return h(
        'span',
        {
          class: classNames(
            'l-select__value',
            !singleSelectedOption.value && 'l-select__value--placeholder'
          )
        },
        singleSelectedOption.value?.label ?? props.placeholder
      );
    };

    const renderDropdownBody = () => {
      if (props.loading) {
        return h('div', { class: 'l-select-dropdown__state' }, '加载中...');
      }

      if (filteredOptions.value.length === 0) {
        return h('div', { class: 'l-select-dropdown__state' }, props.notFoundContent);
      }

      return h(
        'ul',
        {
          class: 'l-select-dropdown__list',
          role: 'listbox',
          'aria-multiselectable': isMultiple.value || undefined
        },
        filteredOptions.value.map((option, index) => {
          const selected = mergedSelectedValues.value.includes(option.value);
          return h(
            'li',
            {
              key: String(option.value),
              class: classNames(
                'l-select-option',
                selected && 'l-select-option--selected',
                index === activeIndex.value && 'l-select-option--active',
                option.disabled && 'l-select-option--disabled'
              ),
              role: 'option',
              'aria-selected': selected
            },
            [
              h(
                'button',
                {
                  type: 'button',
                  class: 'l-select-option__button',
                  disabled: option.disabled,
                  tabIndex: -1,
                  onMousedown: (event: MouseEvent) => event.preventDefault(),
                  onClick: () => selectOption(option)
                },
                option.label
              )
            ]
          );
        })
      );
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
              class: triggerClassName.value,
              disabled: props.disabled,
              tabIndex: props.disabled ? -1 : 0,
              'aria-haspopup': 'listbox',
              'aria-expanded': open.value,
              onClick: toggleDropdown,
              onKeydown
            },
            [
              h(
                'span',
                {
                  class: 'l-select__content'
                },
                [renderSelectionContent()]
              ),
              h(
                'span',
                {
                  class: 'l-select__indicator',
                  'aria-hidden': 'true'
                },
                [h('span', { class: 'l-select__arrow' })]
              )
            ]
          ),
          showClear.value
            ? h(
                'button',
                {
                  type: 'button',
                  class: ['l-select__clear', 'l-field-affix-action'],
                  tabIndex: -1,
                  'aria-label': '清空选择',
                  onMousedown: onClearMouseDown,
                  onClick: onClearClick
                },
                '×'
              )
            : null,
          open.value
            ? h('div', { class: 'l-select-dropdown' }, [
                props.showSearch
                  ? h('div', { class: 'l-select-dropdown__search' }, [
                      h('input', {
                        ref: searchInputRef,
                        class: 'l-select-dropdown__search-input',
                        value: mergedSearchValue.value,
                        placeholder: '搜索选项',
                        onInput: onSearchInput,
                        onKeydown
                      })
                    ])
                  : null,
                renderDropdownBody()
              ])
            : null
        ]
      );
    };
  }
});

export const Select = LSelect;

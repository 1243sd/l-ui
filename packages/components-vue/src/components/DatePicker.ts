import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type PropType
} from 'vue';
import { useLolitaConfig, type ComponentSize } from '../config/context';
import { classNames } from '../utils/classNames';
import type { InputStatus } from './Input';

dayjs.extend(customParseFormat);

const DEFAULT_FORMAT = 'YYYY-MM-DD';
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

type CalendarCell = {
  key: string;
  date: Dayjs;
  label: string;
  inCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
};

const parseValue = (value: string | undefined, format: string): Dayjs | undefined => {
  if (!value) {
    return undefined;
  }

  const strict = dayjs(value, format, true);
  if (strict.isValid()) {
    return strict;
  }

  const fallback = dayjs(value);
  return fallback.isValid() ? fallback : undefined;
};

const buildCalendarCells = (viewMonth: Dayjs, selectedDate: Dayjs | undefined): CalendarCell[] => {
  const monthStart = viewMonth.startOf('month');
  const gridStart = monthStart.subtract(monthStart.day(), 'day');

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = gridStart.add(index, 'day');
    return {
      key: cellDate.format(DEFAULT_FORMAT),
      date: cellDate,
      label: cellDate.format('D'),
      inCurrentMonth: cellDate.month() === viewMonth.month(),
      isSelected: selectedDate ? cellDate.isSame(selectedDate, 'day') : false,
      isToday: cellDate.isSame(dayjs(), 'day')
    };
  });
};

export const LDatePicker = defineComponent({
  name: 'LDatePicker',
  inheritAttrs: false,
  props: {
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    defaultValue: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    placeholder: {
      type: String,
      default: 'Select date'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    allowClear: {
      type: Boolean,
      default: false
    },
    format: {
      type: String,
      default: DEFAULT_FORMAT
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
    'update:value': (value: string | undefined) =>
      value === undefined || typeof value === 'string',
    change: (value: string | undefined) => value === undefined || typeof value === 'string',
    openChange: (open: boolean) => typeof open === 'boolean',
    focus: (event: FocusEvent) => event instanceof FocusEvent,
    blur: (event: FocusEvent) => event instanceof FocusEvent
  },
  setup(props, { attrs, emit }) {
    const config = useLolitaConfig();
    const isControlled = computed(() => props.value !== undefined);
    const internalValue = ref<string | undefined>(props.defaultValue);
    const open = ref(false);
    const hasFocusWithin = ref(false);
    const wrapperRef = ref<HTMLElement | null>(null);

    const mergedValue = computed(() =>
      isControlled.value ? props.value : internalValue.value
    );
    const mergedSize = computed<ComponentSize>(() => props.size ?? config.value.componentSize);
    const selectedDate = computed(() => parseValue(mergedValue.value, props.format));
    const viewMonth = ref((selectedDate.value ?? dayjs()).startOf('month'));

    watch(
      selectedDate,
      (nextDate) => {
        if (nextDate) {
          viewMonth.value = nextDate.startOf('month');
        }
      },
      { immediate: true }
    );

    const showClear = computed(() => props.allowClear && !props.disabled && !!mergedValue.value);
    const wrapperClassName = computed(() =>
      classNames(
        'l-date-picker-wrapper',
        `l-date-picker-wrapper--${mergedSize.value}`,
        props.status !== 'default' && `l-date-picker-wrapper--${props.status}`,
        props.disabled && 'l-date-picker-wrapper--disabled',
        showClear.value && 'l-date-picker-wrapper--clearable',
        open.value && 'l-date-picker-wrapper--open'
      )
    );
    const triggerClassName = computed(() => classNames('l-date-picker'));
    const displayValue = computed(() =>
      selectedDate.value ? selectedDate.value.format(props.format) : props.placeholder
    );
    const calendarCells = computed(() =>
      buildCalendarCells(viewMonth.value, selectedDate.value)
    );
    const monthLabel = computed(() => viewMonth.value.format('YYYY-MM'));

    const setOpen = (nextOpen: boolean): void => {
      if (open.value === nextOpen) {
        return;
      }

      open.value = nextOpen;
      emit('openChange', nextOpen);
    };

    const updateValue = (nextValue: string | undefined): void => {
      if (!isControlled.value) {
        internalValue.value = nextValue;
      }

      emit('update:value', nextValue);
      emit('change', nextValue);
    };

    const toggleOpen = (): void => {
      if (props.disabled) {
        return;
      }

      if (!open.value && selectedDate.value) {
        viewMonth.value = selectedDate.value.startOf('month');
      }

      setOpen(!open.value);
    };

    const closeDropdown = (): void => {
      setOpen(false);
    };

    const onTriggerKeydown = (event: KeyboardEvent): void => {
      if (props.disabled) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (!open.value && selectedDate.value) {
          viewMonth.value = selectedDate.value.startOf('month');
        }
        setOpen(true);
        return;
      }

      if (event.key === 'Escape' && open.value) {
        event.preventDefault();
        closeDropdown();
      }
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

      updateValue(undefined);
      closeDropdown();
    };

    const onSelectDate = (date: Dayjs): void => {
      updateValue(date.format(props.format));
      viewMonth.value = date.startOf('month');
      closeDropdown();
    };

    const renderDropdown = () =>
      h('div', { class: 'l-date-picker-dropdown' }, [
        h('div', { class: 'l-date-picker-dropdown__header' }, [
          h(
            'button',
            {
              type: 'button',
              class: 'l-date-picker-dropdown__nav',
              'aria-label': 'Previous month',
              onClick: () => {
                viewMonth.value = viewMonth.value.subtract(1, 'month');
              }
            },
            '‹'
          ),
          h('div', { class: 'l-date-picker-dropdown__title' }, monthLabel.value),
          h(
            'button',
            {
              type: 'button',
              class: 'l-date-picker-dropdown__nav',
              'aria-label': 'Next month',
              onClick: () => {
                viewMonth.value = viewMonth.value.add(1, 'month');
              }
            },
            '›'
          )
        ]),
        h(
          'div',
          {
            class: 'l-date-picker-dropdown__weekdays'
          },
          WEEKDAY_LABELS.map((label) =>
            h('span', { key: label, class: 'l-date-picker-dropdown__weekday' }, label)
          )
        ),
        h(
          'div',
          {
            class: 'l-date-picker-dropdown__grid'
          },
          calendarCells.value.map((cell) =>
            h(
              'button',
              {
                key: cell.key,
                type: 'button',
                class: classNames(
                  'l-date-picker-dropdown__cell',
                  !cell.inCurrentMonth && 'l-date-picker-dropdown__cell--muted',
                  cell.isSelected && 'l-date-picker-dropdown__cell--selected',
                  cell.isToday && 'l-date-picker-dropdown__cell--today'
                ),
                'data-date': cell.date.format(DEFAULT_FORMAT),
                onClick: () => onSelectDate(cell.date)
              },
              cell.label
            )
          )
        )
      ]);

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
              'aria-haspopup': 'dialog',
              'aria-expanded': open.value,
              onClick: toggleOpen,
              onKeydown: onTriggerKeydown
            },
            [
              h(
                'span',
                {
                  class: classNames(
                    'l-date-picker__value',
                    !selectedDate.value && 'l-date-picker__value--placeholder'
                  )
                },
                displayValue.value
              ),
              h('span', { class: 'l-date-picker__indicator', 'aria-hidden': 'true' }, [
                h('span', { class: 'l-date-picker__icon' })
              ])
            ]
          ),
          showClear.value
            ? h(
                'button',
                {
                  type: 'button',
                  class: ['l-date-picker__clear', 'l-field-affix-action'],
                  tabIndex: -1,
                  'aria-label': 'Clear date',
                  onMousedown: onClearMouseDown,
                  onClick: onClearClick
                },
                '×'
              )
            : null,
          open.value ? renderDropdown() : null
        ]
      );
    };
  }
});

export const DatePicker = LDatePicker;

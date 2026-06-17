import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  computed,
  defineComponent,
  getCurrentInstance,
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
const DEFAULT_PLACEHOLDER = 'Select date range';

type DateRangeValue = [string, string] | undefined;

type CalendarCell = {
  key: string;
  date: Dayjs;
  label: string;
  inCurrentMonth: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isSoftSelected: boolean;
  isSoftInRange: boolean;
  isToday: boolean;
};

const parseDate = (value: string | undefined, format: string): Dayjs | undefined => {
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

const normalizeRange = (
  first: Dayjs,
  second: Dayjs
): [Dayjs, Dayjs] => (first.isAfter(second, 'day') ? [second, first] : [first, second]);

const buildCalendarCells = (
  viewMonth: Dayjs,
  startDate: Dayjs | undefined,
  endDate: Dayjs | undefined,
  draftStartDate: Dayjs | undefined
): CalendarCell[] => {
  const monthStart = viewMonth.startOf('month');
  const gridStart = monthStart.subtract(monthStart.day(), 'day');

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = gridStart.add(index, 'day');
    const activeStartDate = draftStartDate ?? startDate;
    const activeEndDate = draftStartDate ? undefined : endDate;
    const isRangeReady = activeStartDate && activeEndDate;
    const isInRange = Boolean(
      isRangeReady &&
        (cellDate.isSame(activeStartDate, 'day') ||
          cellDate.isSame(activeEndDate, 'day') ||
          (cellDate.isAfter(activeStartDate!, 'day') &&
            cellDate.isBefore(activeEndDate!, 'day')))
    );
    const isSoftRangeReady = draftStartDate && startDate && endDate;
    const isSoftInRange = Boolean(
      isSoftRangeReady &&
        (cellDate.isSame(startDate, 'day') ||
          cellDate.isSame(endDate, 'day') ||
          (cellDate.isAfter(startDate!, 'day') && cellDate.isBefore(endDate!, 'day')))
    );

    return {
      key: cellDate.format(DEFAULT_FORMAT),
      date: cellDate,
      label: cellDate.format('D'),
      inCurrentMonth: cellDate.month() === viewMonth.month(),
      isSelected: Boolean(
        (activeStartDate && cellDate.isSame(activeStartDate, 'day')) ||
          (activeEndDate && cellDate.isSame(activeEndDate, 'day'))
      ),
      isInRange,
      isSoftSelected: Boolean(
        draftStartDate &&
          ((startDate && cellDate.isSame(startDate, 'day')) ||
            (endDate && cellDate.isSame(endDate, 'day')))
      ),
      isSoftInRange,
      isToday: cellDate.isSame(dayjs(), 'day')
    };
  });
};

export const LDateRangePicker = defineComponent({
  name: 'LDateRangePicker',
  inheritAttrs: false,
  props: {
    value: {
      type: Array as unknown as PropType<[string, string] | undefined>,
      default: undefined
    },
    defaultValue: {
      type: Array as unknown as PropType<[string, string] | undefined>,
      default: undefined
    },
    placeholder: {
      type: Array as unknown as PropType<[string, string] | undefined>,
      default: undefined
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
    'update:value': (value: DateRangeValue) =>
      value === undefined ||
      (Array.isArray(value) &&
        value.length === 2 &&
        value.every((item) => typeof item === 'string')),
    change: (value: DateRangeValue) =>
      value === undefined ||
      (Array.isArray(value) &&
        value.length === 2 &&
        value.every((item) => typeof item === 'string')),
    openChange: (open: boolean) => typeof open === 'boolean',
    focus: (event: FocusEvent) => event instanceof FocusEvent,
    blur: (event: FocusEvent) => event instanceof FocusEvent
  },
  setup(props, { attrs, emit }) {
    const config = useLolitaConfig();
    const instance = getCurrentInstance();
    const isControlled = computed(() =>
      Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'value')
    );
    const internalValue = ref<DateRangeValue>(props.defaultValue);
    const open = ref(false);
    const hasFocusWithin = ref(false);
    const wrapperRef = ref<HTMLElement | null>(null);
    const draftStart = ref<Dayjs | undefined>(undefined);

    const mergedValue = computed<DateRangeValue>(() =>
      isControlled.value ? props.value : internalValue.value
    );
    const mergedSize = computed<ComponentSize>(() => props.size ?? config.value.componentSize);
    const selectedStart = computed(() =>
      parseDate(mergedValue.value?.[0], props.format)
    );
    const selectedEnd = computed(() =>
      parseDate(mergedValue.value?.[1], props.format)
    );
    const viewMonth = ref((selectedStart.value ?? dayjs()).startOf('month'));

    watch(
      [selectedStart, selectedEnd],
      ([nextStart]) => {
        if (nextStart) {
          viewMonth.value = nextStart.startOf('month');
        }
      },
      { immediate: true }
    );

    const showClear = computed(
      () =>
        props.allowClear &&
        !props.disabled &&
        !!mergedValue.value?.[0] &&
        !!mergedValue.value?.[1]
    );
    const wrapperClassName = computed(() =>
      classNames(
        'l-date-range-picker-wrapper',
        `l-date-range-picker-wrapper--${mergedSize.value}`,
        props.status !== 'default' && `l-date-range-picker-wrapper--${props.status}`,
        props.disabled && 'l-date-range-picker-wrapper--disabled',
        showClear.value && 'l-date-range-picker-wrapper--clearable',
        open.value && 'l-date-range-picker-wrapper--open'
      )
    );
    const triggerClassName = computed(() => classNames('l-date-range-picker'));
    const displayValue = computed(() => {
      if (selectedStart.value && selectedEnd.value) {
        return `${selectedStart.value.format(props.format)} ~ ${selectedEnd.value.format(props.format)}`;
      }

      return props.placeholder?.join(' ~ ') ?? DEFAULT_PLACEHOLDER;
    });
    const calendarCells = computed(() =>
      buildCalendarCells(
        viewMonth.value,
        selectedStart.value,
        selectedEnd.value,
        draftStart.value
      )
    );
    const monthLabel = computed(() => viewMonth.value.format('YYYY-MM'));

    const setOpen = (nextOpen: boolean): void => {
      if (open.value === nextOpen) {
        return;
      }

      open.value = nextOpen;
      if (nextOpen) {
        draftStart.value = undefined;
      }
      emit('openChange', nextOpen);
    };

    const updateValue = (nextValue: DateRangeValue): void => {
      if (!isControlled.value) {
        internalValue.value = nextValue;
      }

      emit('update:value', nextValue);
      emit('change', nextValue);
    };

    const closeDropdown = (): void => {
      draftStart.value = undefined;
      setOpen(false);
    };

    const toggleOpen = (): void => {
      if (props.disabled) {
        return;
      }

      if (!open.value && selectedStart.value) {
        viewMonth.value = selectedStart.value.startOf('month');
      }

      setOpen(!open.value);
    };

    const onTriggerKeydown = (event: KeyboardEvent): void => {
      if (props.disabled) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (!open.value && selectedStart.value) {
          viewMonth.value = selectedStart.value.startOf('month');
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

    const onClearClick = (event: MouseEvent): void => {
      event.stopPropagation();
      if (props.disabled) {
        return;
      }

      updateValue(undefined);
      closeDropdown();
    };

    const onSelectDate = (date: Dayjs): void => {
      if (!draftStart.value) {
        draftStart.value = date;
        return;
      }

      const [start, end] = normalizeRange(draftStart.value, date);
      draftStart.value = undefined;
      updateValue([start.format(props.format), end.format(props.format)]);
      viewMonth.value = start.startOf('month');
      closeDropdown();
    };

    const renderDropdown = () =>
      h('div', { class: 'l-date-range-picker-dropdown' }, [
        h('div', { class: 'l-date-range-picker-dropdown__header' }, [
          h(
            'button',
            {
              type: 'button',
              class: 'l-date-range-picker-dropdown__nav',
              'aria-label': 'Previous month',
              onClick: () => {
                viewMonth.value = viewMonth.value.subtract(1, 'month');
              }
            },
            '‹'
          ),
          h('div', { class: 'l-date-range-picker-dropdown__title' }, monthLabel.value),
          h(
            'button',
            {
              type: 'button',
              class: 'l-date-range-picker-dropdown__nav',
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
            class: 'l-date-range-picker-dropdown__weekdays'
          },
          WEEKDAY_LABELS.map((label) =>
            h('span', { key: label, class: 'l-date-range-picker-dropdown__weekday' }, label)
          )
        ),
        h(
          'div',
          {
            class: 'l-date-range-picker-dropdown__grid'
          },
          calendarCells.value.map((cell) =>
            h(
              'button',
              {
                key: cell.key,
                type: 'button',
                class: classNames(
                  'l-date-range-picker-dropdown__cell',
                  !cell.inCurrentMonth && 'l-date-range-picker-dropdown__cell--muted',
                  cell.isToday && 'l-date-range-picker-dropdown__cell--today',
                  cell.isSoftInRange && 'l-date-range-picker-dropdown__cell--soft-in-range',
                  cell.isSoftSelected && 'l-date-range-picker-dropdown__cell--soft-selected',
                  cell.isInRange && 'l-date-range-picker-dropdown__cell--in-range',
                  cell.isSelected && 'l-date-range-picker-dropdown__cell--selected'
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
                    'l-date-range-picker__value',
                    !(selectedStart.value && selectedEnd.value) &&
                      'l-date-range-picker__value--placeholder'
                  )
                },
                displayValue.value
              ),
              h('span', { class: 'l-date-range-picker__indicator', 'aria-hidden': 'true' }, [
                h('span', { class: 'l-date-range-picker__icon' })
              ])
            ]
          ),
          showClear.value
            ? h(
                'button',
                {
                  type: 'button',
                  class: ['l-date-range-picker__clear', 'l-field-affix-action'],
                  tabIndex: -1,
                  'aria-label': 'Clear date range',
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

export const DateRangePicker = LDateRangePicker;

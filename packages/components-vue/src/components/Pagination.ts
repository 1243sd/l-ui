import { computed, defineComponent, h, ref, watch, type PropType } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';

const toPositiveInteger = (value: number | undefined, fallback: number): number => {
  const normalized = Number.isFinite(value) ? Math.trunc(Number(value)) : fallback;
  return normalized > 0 ? normalized : fallback;
};

const clampPage = (page: number, totalPages: number): number => {
  return Math.min(Math.max(page, 1), totalPages);
};

export const LPagination = defineComponent({
  name: 'LPagination',
  inheritAttrs: false,
  props: {
    current: {
      type: Number as PropType<number | undefined>,
      default: undefined
    },
    defaultCurrent: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    total: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:current': (value: number) => Number.isInteger(value) && value > 0,
    change: (value: number) => Number.isInteger(value) && value > 0
  },
  setup(props, { attrs, emit }) {
    const config = useLolitaConfig();
    const isControlled = computed(() => props.current !== undefined);
    const internalCurrent = ref(toPositiveInteger(props.defaultCurrent, 1));
    const rootClassName = computed(() =>
      classNames('l-pagination', `${config.value.prefixCls}-pagination`)
    );
    const normalizedPageSize = computed(() => toPositiveInteger(props.pageSize, 20));
    const normalizedTotal = computed(() => Math.max(0, Math.trunc(props.total)));
    const totalPages = computed(() =>
      Math.max(1, Math.ceil(normalizedTotal.value / normalizedPageSize.value))
    );
    const mergedCurrent = computed(() => {
      const preferred = isControlled.value
        ? toPositiveInteger(props.current, 1)
        : internalCurrent.value;
      return clampPage(preferred, totalPages.value);
    });

    watch(totalPages, (nextTotalPages) => {
      if (!isControlled.value) {
        internalCurrent.value = clampPage(internalCurrent.value, nextTotalPages);
      }
    });

    const setPage = (page: number): void => {
      if (props.disabled) {
        return;
      }

      const nextPage = clampPage(page, totalPages.value);
      if (nextPage === mergedCurrent.value) {
        return;
      }

      if (!isControlled.value) {
        internalCurrent.value = nextPage;
      }

      emit('update:current', nextPage);
      emit('change', nextPage);
    };

    const pages = computed(() =>
      Array.from({ length: totalPages.value }, (_, index) => index + 1)
    );

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;
      const previousDisabled = props.disabled || mergedCurrent.value <= 1;
      const nextDisabled = props.disabled || mergedCurrent.value >= totalPages.value;

      return h(
        'nav',
        {
          ...rootAttrs,
          class: [rootClassName.value, attrsClass],
          style: attrsStyle,
          'aria-label': 'Pagination'
        },
        [
          h(
            'button',
            {
              type: 'button',
              class: classNames(
                'l-pagination__nav',
                'l-pagination__nav--prev',
                previousDisabled && 'l-pagination__nav--disabled'
              ),
              disabled: previousDisabled,
              onClick: () => setPage(mergedCurrent.value - 1)
            },
            '上一页'
          ),
          h(
            'div',
            {
              class: 'l-pagination__pages'
            },
            pages.value.map((page) =>
              h(
                'button',
                {
                  key: page,
                  type: 'button',
                  class: classNames(
                    'l-pagination__item',
                    page === mergedCurrent.value && 'l-pagination__item--active'
                  ),
                  'aria-current': page === mergedCurrent.value ? 'page' : undefined,
                  disabled: props.disabled,
                  onClick: () => setPage(page)
                },
                String(page)
              )
            )
          ),
          h(
            'button',
            {
              type: 'button',
              class: classNames(
                'l-pagination__nav',
                'l-pagination__nav--next',
                nextDisabled && 'l-pagination__nav--disabled'
              ),
              disabled: nextDisabled,
              onClick: () => setPage(mergedCurrent.value + 1)
            },
            '下一页'
          )
        ]
      );
    };
  }
});

export const Pagination = LPagination;

import {
  Teleport,
  computed,
  defineComponent,
  h,
  ref,
  type PropType
} from 'vue';
import { classNames } from '../utils/classNames';
import {
  createOverlayId,
  type OverlayPlacement,
  useFloatingOverlayPosition,
  useOverlayOpenState
} from './overlayState';

export type TooltipTrigger = 'hover' | 'focus';

export const LTooltip = defineComponent({
  name: 'LTooltip',
  inheritAttrs: false,
  props: {
    title: {
      type: String,
      default: ''
    },
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    trigger: {
      type: String as PropType<TooltipTrigger>,
      default: 'hover'
    },
    placement: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'top'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    teleported: {
      type: Boolean,
      default: true
    }
  },
  emits: {
    'update:open': (value: boolean) => typeof value === 'boolean',
    openChange: (value: boolean) => typeof value === 'boolean'
  },
  setup(props, { attrs, slots, emit }) {
    const hostRef = ref<HTMLElement | null>(null);
    const overlayId = createOverlayId('l-tooltip');
    const overlayState = useOverlayOpenState(props, emit);
    const placementRef = computed<OverlayPlacement>(() => props.placement);
    const teleportedRef = computed(() => props.teleported);
    const { overlayStyle } = useFloatingOverlayPosition(
      hostRef,
      overlayState.open,
      placementRef,
      teleportedRef
    );

    const openOverlay = (): void => {
      if (!props.disabled && props.title) {
        overlayState.openOverlay();
      }
    };

    const closeOverlay = (): void => {
      overlayState.closeOverlay();
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;
      const triggerAttrs =
        props.title && overlayState.open.value
          ? { 'aria-describedby': overlayId }
          : {};

      const overlayNode =
        overlayState.open.value && props.title
          ? h(
              'div',
              {
                id: overlayId,
                class: classNames(
                  'l-tooltip__overlay',
                  'l-floating-overlay',
                  `l-floating-overlay--${props.placement}`
                ),
                role: 'tooltip',
                style: overlayStyle.value
              },
              props.title
            )
          : null;

      const overlayContent =
        overlayNode && props.teleported
          ? h(Teleport, { to: 'body' }, overlayNode)
          : overlayNode;

      return h(
        'span',
        {
          ...rootAttrs,
          ref: hostRef,
          class: ['l-overlay-host', 'l-tooltip', attrsClass],
          style: attrsStyle
        },
        [
          h(
            'span',
            {
              ...triggerAttrs,
              class: 'l-overlay-trigger',
              onMouseenter: props.trigger === 'hover' ? openOverlay : undefined,
              onMouseleave: props.trigger === 'hover' ? closeOverlay : undefined,
              onFocusin: props.trigger === 'focus' ? openOverlay : undefined,
              onFocusout: props.trigger === 'focus' ? closeOverlay : undefined
            },
            slots.default?.()
          ),
          overlayContent
        ]
      );
    };
  }
});

export const Tooltip = LTooltip;

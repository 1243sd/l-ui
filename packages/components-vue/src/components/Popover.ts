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
  isPointerMovingWithinLayers,
  type OverlayPlacement,
  useFloatingOverlayPosition,
  useOverlayDismiss,
  useOverlayOpenState
} from './overlayState';

export type PopoverTrigger = 'click' | 'hover';

export const LPopover = defineComponent({
  name: 'LPopover',
  inheritAttrs: false,
  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
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
      type: String as PropType<PopoverTrigger>,
      default: 'click'
    },
    placement: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'bottom'
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
    const overlayRef = ref<HTMLElement | null>(null);
    const overlayId = createOverlayId('l-popover');
    const overlayState = useOverlayOpenState(props, emit);
    const placementRef = computed<OverlayPlacement>(() => props.placement);
    const teleportedRef = computed(() => props.teleported);
    const { overlayStyle } = useFloatingOverlayPosition(
      hostRef,
      overlayState.open,
      placementRef,
      teleportedRef
    );

    useOverlayDismiss({
      openRef: overlayState.open,
      layerRefs: [hostRef, overlayRef],
      onEscape: () => {
        if (props.trigger === 'click') {
          overlayState.closeOverlay();
        }
      },
      onOutsidePress: () => {
        if (props.trigger === 'click') {
          overlayState.closeOverlay();
        }
      }
    });

    const openOverlay = (): void => {
      if (!props.disabled && (props.title || props.content || slots.content)) {
        overlayState.openOverlay();
      }
    };

    const closeOverlay = (): void => {
      overlayState.closeOverlay();
    };

    const maybeCloseHoverOverlay = (event: MouseEvent): void => {
      if (
        props.trigger === 'hover' &&
        !isPointerMovingWithinLayers(event, [hostRef, overlayRef])
      ) {
        closeOverlay();
      }
    };

    const toggleOverlay = (): void => {
      if (!props.disabled) {
        overlayState.toggleOpen();
      }
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;
      const overlayNode =
        overlayState.open.value
          ? h(
              'div',
              {
                id: overlayId,
                ref: overlayRef,
                class: classNames(
                  'l-popover__overlay',
                  'l-floating-overlay',
                  `l-floating-overlay--${props.placement}`
                ),
                role: 'dialog',
                style: overlayStyle.value,
                onMouseenter: props.trigger === 'hover' ? openOverlay : undefined,
                onMouseleave: props.trigger === 'hover' ? maybeCloseHoverOverlay : undefined
              },
              [
                props.title || slots.title
                  ? h(
                      'div',
                      { class: 'l-popover__title' },
                      slots.title?.() ?? props.title
                    )
                  : null,
                h(
                  'div',
                  { class: 'l-popover__content' },
                  slots.content?.() ?? props.content
                )
              ]
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
          class: ['l-overlay-host', 'l-popover', attrsClass],
          style: attrsStyle
        },
        [
          h(
            'span',
            {
              class: 'l-overlay-trigger',
              'aria-expanded': overlayState.open.value ? 'true' : 'false',
              'aria-controls': overlayState.open.value ? overlayId : undefined,
              onClick: props.trigger === 'click' ? toggleOverlay : undefined,
              onMouseenter: props.trigger === 'hover' ? openOverlay : undefined,
              onMouseleave: props.trigger === 'hover' ? maybeCloseHoverOverlay : undefined
            },
            slots.default?.()
          ),
          overlayContent
        ]
      );
    };
  }
});

export const Popover = LPopover;

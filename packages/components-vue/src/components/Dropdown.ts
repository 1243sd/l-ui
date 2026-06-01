import {
  Teleport,
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  type PropType
} from 'vue';
import { classNames } from '../utils/classNames';
import { LMenu, type MenuItem } from './Menu';
import {
  isPointerMovingWithinLayers,
  type OverlayPlacement,
  useFloatingOverlayPosition,
  useOverlayDismiss,
  useOverlayOpenState
} from './overlayState';

export type DropdownPlacement = 'bottom' | 'bottomLeft' | 'bottomRight';
export type DropdownTrigger = 'click' | 'hover';

export const LDropdown = defineComponent({
  name: 'LDropdown',
  inheritAttrs: false,
  props: {
    menuItems: {
      type: Array as PropType<MenuItem[]>,
      default: () => []
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
      type: String as PropType<DropdownTrigger>,
      default: 'click'
    },
    placement: {
      type: String as PropType<DropdownPlacement>,
      default: 'bottomLeft'
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
    openChange: (value: boolean) => typeof value === 'boolean',
    select: (value: string) => typeof value === 'string'
  },
  setup(props, { attrs, slots, emit }) {
    const hostRef = ref<HTMLElement | null>(null);
    const overlayRef = ref<HTMLElement | null>(null);
    const menuRef = ref<{ focusFirst: () => void } | null>(null);
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
      onEscape: () => overlayState.closeOverlay(),
      onOutsidePress: () => overlayState.closeOverlay()
    });

    const openOverlay = (): void => {
      if (!props.disabled && props.menuItems.length > 0) {
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

    const focusFirstMenuItem = (): void => {
      nextTick(() => menuRef.value?.focusFirst());
    };

    const onTriggerKeydown = async (event: KeyboardEvent): Promise<void> => {
      if (props.disabled) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openOverlay();
        focusFirstMenuItem();
      }
    };

    const onSelect = (key: string): void => {
      emit('select', key);
      closeOverlay();
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;
      const overlayNode =
        overlayState.open.value
          ? h(
              'div',
              {
                ref: overlayRef,
                class: classNames(
                  'l-dropdown__overlay',
                  'l-floating-overlay',
                  `l-floating-overlay--${props.placement}`
                ),
                style: overlayStyle.value,
                onMouseenter: props.trigger === 'hover' ? openOverlay : undefined,
                onMouseleave: props.trigger === 'hover' ? maybeCloseHoverOverlay : undefined
              },
              [
                h(LMenu, {
                  ref: menuRef,
                  items: props.menuItems,
                  onSelect
                })
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
          class: ['l-overlay-host', 'l-dropdown', attrsClass],
          style: attrsStyle
        },
        [
          h(
            'span',
            {
              class: 'l-overlay-trigger',
              'aria-haspopup': 'menu',
              'aria-expanded': overlayState.open.value ? 'true' : 'false',
              onClick:
                props.trigger === 'click' && !props.disabled
                  ? () => overlayState.toggleOpen()
                  : undefined,
              onMouseenter: props.trigger === 'hover' ? openOverlay : undefined,
              onMouseleave: props.trigger === 'hover' ? maybeCloseHoverOverlay : undefined,
              onKeydown: onTriggerKeydown
            },
            slots.default?.()
          ),
          overlayContent
        ]
      );
    };
  }
});

export const Dropdown = LDropdown;

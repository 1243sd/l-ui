import {
  Teleport,
  defineComponent,
  h,
  ref,
  watch,
  type PropType
} from 'vue';
import { useFocusScope } from './focusScope';
import { createOverlayId, useOverlayDismiss, useOverlayOpenState } from './overlayState';

const resolveDimension = (value: number | string | undefined, fallback: string): string =>
  typeof value === 'number' ? `${value}px` : (value ?? fallback);

export type DrawerPlacement = 'left' | 'right';

export const LDrawer = defineComponent({
  name: 'LDrawer',
  inheritAttrs: false,
  props: {
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    placement: {
      type: String as PropType<DrawerPlacement>,
      default: 'right'
    },
    closable: {
      type: Boolean,
      default: true
    },
    maskClosable: {
      type: Boolean,
      default: true
    },
    keyboard: {
      type: Boolean,
      default: true
    },
    width: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: 420
    },
    teleported: {
      type: Boolean,
      default: true
    }
  },
  emits: {
    'update:open': (value: boolean) => typeof value === 'boolean',
    openChange: (value: boolean) => typeof value === 'boolean',
    close: () => true
  },
  setup(props, { attrs, slots, emit }) {
    const panelRef = ref<HTMLElement | null>(null);
    const lastFocusedElement = ref<HTMLElement | null>(null);
    const overlayState = useOverlayOpenState(props, emit);
    const titleId = createOverlayId('l-drawer-title');

    watch(
      overlayState.open,
      (isOpen, wasOpen) => {
        if (isOpen && !wasOpen) {
          lastFocusedElement.value =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }
      }
    );

    useFocusScope(overlayState.open, panelRef, {
      lockScroll: true,
      returnFocus: () => lastFocusedElement.value
    });

    const requestClose = (): void => {
      emit('close');
      overlayState.closeOverlay();
    };

    useOverlayDismiss({
      openRef: overlayState.open,
      layerRefs: [panelRef],
      onEscape: () => {
        if (props.keyboard) {
          requestClose();
        }
      }
    });

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;

      if (!overlayState.open.value) {
        return null;
      }

      const overlayNode = h(
        'div',
        {
          ...rootAttrs,
          class: ['l-drawer__overlay', attrsClass],
          style: attrsStyle
        },
        [
          h('div', {
            class: 'l-drawer__mask',
            onClick: () => {
              if (props.maskClosable) {
                requestClose();
              }
            }
          }),
          h(
            'div',
            {
              ref: panelRef,
              class: ['l-drawer__panel', `l-drawer__panel--${props.placement}`],
              role: 'dialog',
              tabIndex: -1,
              'aria-modal': 'true',
              'aria-labelledby': props.title ? titleId : undefined,
              style: {
                width: resolveDimension(props.width, '420px')
              }
            },
            [
              h('div', { class: 'l-drawer__header' }, [
                h(
                  'div',
                  {
                    id: titleId,
                    class: 'l-drawer__title'
                  },
                  props.title
                ),
                props.closable
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: 'l-drawer__close',
                        'aria-label': '关闭抽屉',
                        onClick: requestClose
                      },
                      '×'
                    )
                  : null
              ]),
              h(
                'div',
                { class: 'l-drawer__body' },
                slots.default?.()
              )
            ]
          )
        ]
      );

      return props.teleported ? h(Teleport, { to: 'body' }, overlayNode) : overlayNode;
    };
  }
});

export const Drawer = LDrawer;

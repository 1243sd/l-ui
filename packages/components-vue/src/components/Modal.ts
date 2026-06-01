import {
  Teleport,
  defineComponent,
  h,
  ref,
  watch,
  type PropType
} from 'vue';
import { LButton } from './Button';
import { useFocusScope } from './focusScope';
import { createOverlayId, useOverlayDismiss, useOverlayOpenState } from './overlayState';

const resolveDimension = (value: number | string | undefined, fallback: string): string =>
  typeof value === 'number' ? `${value}px` : (value ?? fallback);

export const LModal = defineComponent({
  name: 'LModal',
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
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    width: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: 560
    },
    teleported: {
      type: Boolean,
      default: true
    }
  },
  emits: {
    'update:open': (value: boolean) => typeof value === 'boolean',
    openChange: (value: boolean) => typeof value === 'boolean',
    ok: () => true,
    cancel: () => true
  },
  setup(props, { attrs, slots, emit }) {
    const panelRef = ref<HTMLElement | null>(null);
    const lastFocusedElement = ref<HTMLElement | null>(null);
    const overlayState = useOverlayOpenState(props, emit);
    const titleId = createOverlayId('l-modal-title');

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

    useOverlayDismiss({
      openRef: overlayState.open,
      layerRefs: [panelRef],
      onEscape: () => {
        if (props.keyboard) {
          emit('cancel');
          overlayState.closeOverlay();
        }
      }
    });

    const requestCancel = (): void => {
      emit('cancel');
      overlayState.closeOverlay();
    };

    const requestOk = (): void => {
      emit('ok');
      overlayState.closeOverlay();
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;
      const shouldRender = overlayState.open.value || !props.destroyOnClose;

      if (!shouldRender) {
        return null;
      }

      const overlayNode = h(
        'div',
        {
          ...rootAttrs,
          class: ['l-modal__overlay', attrsClass],
          style: attrsStyle,
          hidden: !overlayState.open.value
        },
        [
          h('div', {
            class: 'l-modal__mask',
            onClick: () => {
              if (props.maskClosable) {
                requestCancel();
              }
            }
          }),
          h(
            'div',
            {
              ref: panelRef,
              class: 'l-modal__panel',
              role: 'dialog',
              tabIndex: -1,
              'aria-modal': 'true',
              'aria-labelledby': props.title ? titleId : undefined,
              style: {
                width: resolveDimension(props.width, '560px')
              }
            },
            [
              h('div', { class: 'l-modal__header' }, [
                h(
                  'div',
                  {
                    id: titleId,
                    class: 'l-modal__title'
                  },
                  props.title
                ),
                props.closable
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: 'l-modal__close',
                        'aria-label': '关闭弹窗',
                        onClick: requestCancel
                      },
                      '×'
                    )
                  : null
              ]),
              h(
                'div',
                { class: 'l-modal__body' },
                slots.default?.()
              ),
              h('div', { class: 'l-modal__footer' }, [
                h(
                  LButton,
                  {
                    class: 'l-modal__cancel',
                    onClick: requestCancel
                  },
                  () => '取消'
                ),
                h(
                  LButton,
                  {
                    class: 'l-modal__ok',
                    type: 'primary',
                    onClick: requestOk
                  },
                  () => '确定'
                )
              ])
            ]
          )
        ]
      );

      return props.teleported ? h(Teleport, { to: 'body' }, overlayNode) : overlayNode;
    };
  }
});

export const Modal = LModal;

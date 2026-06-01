import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
  type CSSProperties,
  type Ref
} from 'vue';

export type OverlayPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'bottomLeft'
  | 'bottomRight';

export type OverlayStateProps = {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
};

type OverlayEmit = (...args: any[]) => void;

let overlayIdSeed = 0;

export const createOverlayId = (prefix = 'l-overlay'): string => {
  overlayIdSeed += 1;
  return `${prefix}-${overlayIdSeed}`;
};

export const useOverlayOpenState = (
  props: OverlayStateProps,
  emit: OverlayEmit
) => {
  const isControlled = computed(() => props.open !== undefined);
  const internalOpen = ref(props.defaultOpen ?? false);
  const open = computed<boolean>(() =>
    isControlled.value ? props.open === true : internalOpen.value
  );

  const setOpen = (nextOpen: boolean): boolean => {
    if (props.disabled) {
      return false;
    }

    if (open.value === nextOpen) {
      return false;
    }

    if (!isControlled.value) {
      internalOpen.value = nextOpen;
    }

    emit('update:open', nextOpen);
    emit('openChange', nextOpen);
    return true;
  };

  const openOverlay = (): boolean => setOpen(true);
  const closeOverlay = (): boolean => setOpen(false);
  const toggleOpen = (): boolean => setOpen(!open.value);

  return {
    open,
    isControlled,
    setOpen,
    openOverlay,
    closeOverlay,
    toggleOpen
  };
};

export const resolveInlineOverlayStyle = (
  placement: OverlayPlacement
): CSSProperties => {
  switch (placement) {
    case 'top':
      return {
        top: '0',
        left: '50%',
        transform: 'translate(-50%, calc(-100% - 8px))'
      };
    case 'left':
      return {
        top: '50%',
        left: '0',
        transform: 'translate(calc(-100% - 8px), -50%)'
      };
    case 'right':
      return {
        top: '50%',
        left: '100%',
        transform: 'translate(8px, -50%)'
      };
    case 'bottomLeft':
      return {
        top: '100%',
        left: '0',
        transform: 'translateY(8px)'
      };
    case 'bottomRight':
      return {
        top: '100%',
        right: '0',
        transform: 'translateY(8px)'
      };
    case 'bottom':
    default:
      return {
        top: '100%',
        left: '50%',
        transform: 'translate(-50%, 8px)'
      };
  }
};

export const resolveTeleportedOverlayStyle = (
  rect: DOMRect,
  placement: OverlayPlacement
): CSSProperties => {
  switch (placement) {
    case 'top':
      return {
        top: `${rect.top}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, calc(-100% - 8px))'
      };
    case 'left':
      return {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.left}px`,
        transform: 'translate(calc(-100% - 8px), -50%)'
      };
    case 'right':
      return {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right}px`,
        transform: 'translate(8px, -50%)'
      };
    case 'bottomLeft':
      return {
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
        transform: 'translateY(8px)'
      };
    case 'bottomRight':
      return {
        top: `${rect.bottom}px`,
        left: `${rect.right}px`,
        transform: 'translate(calc(-100%), 8px)'
      };
    case 'bottom':
    default:
      return {
        top: `${rect.bottom}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, 8px)'
      };
  }
};

export const useFloatingOverlayPosition = (
  anchorRef: Ref<HTMLElement | null>,
  openRef: Ref<boolean>,
  placementRef: Ref<OverlayPlacement>,
  teleportedRef: Ref<boolean>
): {
  overlayStyle: Ref<CSSProperties>;
  syncPosition: () => void;
} => {
  const overlayStyle = ref<CSSProperties>(
    resolveInlineOverlayStyle(placementRef.value)
  );
  let detachPositionListeners: (() => void) | undefined;

  const syncPosition = (): void => {
    const anchor = anchorRef.value;
    if (!anchor || !teleportedRef.value) {
      overlayStyle.value = resolveInlineOverlayStyle(placementRef.value);
      return;
    }

    overlayStyle.value = {
      position: 'fixed',
      ...resolveTeleportedOverlayStyle(anchor.getBoundingClientRect(), placementRef.value)
    };
  };

  const stopPositionTracking = (): void => {
    detachPositionListeners?.();
    detachPositionListeners = undefined;
  };

  watch(
    [openRef, placementRef, teleportedRef],
    ([isOpen]) => {
      stopPositionTracking();

      if (!isOpen) {
        overlayStyle.value = resolveInlineOverlayStyle(placementRef.value);
        return;
      }

      syncPosition();

      if (!teleportedRef.value || typeof window === 'undefined') {
        return;
      }

      const handleViewportChange = () => syncPosition();
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('scroll', handleViewportChange, true);
      detachPositionListeners = () => {
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('scroll', handleViewportChange, true);
      };
    },
    { immediate: true }
  );

  onBeforeUnmount(() => stopPositionTracking());

  return {
    overlayStyle,
    syncPosition
  };
};

export const useOverlayDismiss = (options: {
  openRef: Ref<boolean>;
  layerRefs: Array<Ref<HTMLElement | null>>;
  onEscape?: () => void;
  onOutsidePress?: () => void;
}): void => {
  let detachListeners: (() => void) | undefined;

  const stopListening = (): void => {
    detachListeners?.();
    detachListeners = undefined;
  };

  watch(
    options.openRef,
    (isOpen) => {
      stopListening();

      if (!isOpen || typeof document === 'undefined') {
        return;
      }

      const handleKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          options.onEscape?.();
        }
      };

      const handlePointerDown = (event: MouseEvent): void => {
        const target = event.target as Node | null;
        const isInsideLayer = options.layerRefs.some((layerRef) =>
          layerRef.value?.contains(target)
        );

        if (!isInsideLayer) {
          options.onOutsidePress?.();
        }
      };

      document.addEventListener('keydown', handleKeydown, true);
      document.addEventListener('mousedown', handlePointerDown, true);
      detachListeners = () => {
        document.removeEventListener('keydown', handleKeydown, true);
        document.removeEventListener('mousedown', handlePointerDown, true);
      };
    },
    { immediate: true }
  );

  onBeforeUnmount(() => stopListening());
};

export const isPointerMovingWithinLayers = (
  event: MouseEvent,
  layerRefs: Array<Ref<HTMLElement | null>>
): boolean => {
  const relatedTarget = event.relatedTarget as Node | null;

  if (!relatedTarget) {
    return false;
  }

  return layerRefs.some((layerRef) => layerRef.value?.contains(relatedTarget));
};

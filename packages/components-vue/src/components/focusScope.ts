import { onBeforeUnmount, watch, type Ref } from 'vue';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

let bodyScrollLockDepth = 0;
let previousBodyOverflow = '';

export type FocusScopeOptions = {
  trap?: boolean;
  lockScroll?: boolean;
  initialFocus?: () => HTMLElement | null;
  returnFocus?: () => HTMLElement | null;
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true'
  );

export const acquireBodyScrollLock = (): (() => void) => {
  if (typeof document === 'undefined') {
    return () => undefined;
  }

  if (bodyScrollLockDepth === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  bodyScrollLockDepth += 1;

  return () => {
    bodyScrollLockDepth = Math.max(0, bodyScrollLockDepth - 1);
    if (bodyScrollLockDepth === 0) {
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = '';
    }
  };
};

const trapTabKey = (event: KeyboardEvent, container: HTMLElement): void => {
  if (event.key !== 'Tab') {
    return;
  }

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const currentIndex = focusableElements.findIndex(
    (element) => element === document.activeElement
  );

  if (event.shiftKey) {
    if (currentIndex <= 0) {
      event.preventDefault();
      focusableElements[focusableElements.length - 1]?.focus();
    }
    return;
  }

  if (currentIndex === -1 || currentIndex === focusableElements.length - 1) {
    event.preventDefault();
    focusableElements[0]?.focus();
  }
};

export const activateFocusScope = (
  container: HTMLElement,
  options: FocusScopeOptions = {}
): (() => void) => {
  const previousActiveElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const releaseScrollLock = options.lockScroll ? acquireBodyScrollLock() : undefined;

  const target =
    options.initialFocus?.() ?? getFocusableElements(container)[0] ?? container;
  target.focus();

  const handleKeydown = (event: KeyboardEvent): void => {
    if (options.trap === false) {
      return;
    }

    trapTabKey(event, container);
  };

  document.addEventListener('keydown', handleKeydown, true);

  return () => {
    document.removeEventListener('keydown', handleKeydown, true);
    releaseScrollLock?.();
    (options.returnFocus?.() ?? previousActiveElement)?.focus?.();
  };
};

export const useFocusScope = (
  openRef: Ref<boolean>,
  containerRef: Ref<HTMLElement | null>,
  options: FocusScopeOptions = {}
): void => {
  let deactivate: (() => void) | undefined;

  watch(
    [openRef, containerRef],
    ([isOpen, container]) => {
      deactivate?.();
      deactivate = undefined;

      if (!isOpen || !container) {
        return;
      }

      deactivate = activateFocusScope(container, options);
    },
    { immediate: true }
  );

  onBeforeUnmount(() => deactivate?.());
};

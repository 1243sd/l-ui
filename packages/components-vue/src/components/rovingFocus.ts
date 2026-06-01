export const findFirstEnabledIndex = <T>(
  items: T[],
  isDisabled: (item: T, index: number) => boolean
): number => items.findIndex((item, index) => !isDisabled(item, index));

export const findLastEnabledIndex = <T>(
  items: T[],
  isDisabled: (item: T, index: number) => boolean
): number => {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!isDisabled(items[index], index)) {
      return index;
    }
  }

  return -1;
};

export const resolveRovingIndex = <T>(
  items: T[],
  preferredIndex: number,
  isDisabled: (item: T, index: number) => boolean
): number => {
  if (preferredIndex >= 0 && preferredIndex < items.length && !isDisabled(items[preferredIndex], preferredIndex)) {
    return preferredIndex;
  }

  return findFirstEnabledIndex(items, isDisabled);
};

export const moveRovingIndex = <T>(
  items: T[],
  currentIndex: number,
  direction: 1 | -1,
  isDisabled: (item: T, index: number) => boolean
): number => {
  if (items.length === 0) {
    return -1;
  }

  let nextIndex = currentIndex;
  for (let step = 0; step < items.length; step += 1) {
    nextIndex =
      nextIndex < 0
        ? direction > 0
          ? 0
          : items.length - 1
        : (nextIndex + direction + items.length) % items.length;

    if (!isDisabled(items[nextIndex], nextIndex)) {
      return nextIndex;
    }
  }

  return -1;
};

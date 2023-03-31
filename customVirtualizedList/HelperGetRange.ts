const positiveValueOrZero = (x: number): number => Math.max(x, 0);

const getRangeWithoutFloatHandling = (
  data: Array<unknown>,
  currentlyFocusedItemIndex: number,
  numberOfRenderedItems = 8
) => {
  const halfWindow = numberOfRenderedItems / 2;
  const lastDataIndex = data.length - 1;

  const rawStartIndex = currentlyFocusedItemIndex - halfWindow;
  const rawEndIndex = currentlyFocusedItemIndex + halfWindow - 1;

  /*
   * if sum does not fit the window size, then we are in of these cases:
   * - at the beginning of the data
   * - at the end of the data
   * - or we have too few data
   */
  if (rawStartIndex < 0) {
    const finalEndIndex = numberOfRenderedItems - 1;
    return {
      start: 0,
      end: positiveValueOrZero(Math.min(finalEndIndex, lastDataIndex)),
    };
  }

  if (rawEndIndex > data.length - 1) {
    const finalStartIndex = lastDataIndex - numberOfRenderedItems + 1;
    return { start: positiveValueOrZero(finalStartIndex), end: lastDataIndex };
  }

  return { start: rawStartIndex, end: rawEndIndex };
};

/**
 * Computes an array slice for virtualization
 * Have a look at the tests to get examples!
 *
 * The tricky part is that we handle cases were the data is smaller than the window,
 * or when we are on the beginning of the screen...
 */
export const getRange = (
  data: Array<unknown>,
  currentlyFocusedItemIndex: number,
  numberOfRenderedItems = 8
): { start: number; end: number } => {
  if (numberOfRenderedItems <= 0) {
    return { start: 0, end: 0 };
  }

  const result = getRangeWithoutFloatHandling(
    data,
    currentlyFocusedItemIndex,
    numberOfRenderedItems
  );

  return { start: Math.ceil(result.start), end: Math.ceil(result.end) };
};

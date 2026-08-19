const CM_TO_INCH = 0.393701;

/** Rotunjește la o zecimală — suficient de precis pentru un ghid de mărimi. */
export function cmToInches(cm: number): number {
  return Math.round(cm * CM_TO_INCH * 10) / 10;
}

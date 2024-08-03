export function createNumberRange(start: number, end: number) {
  let rangeNumbers: number[] = [];

  for (let i = start; i <= end; ++i) {
    rangeNumbers.push(i);
  }

  return rangeNumbers;
}

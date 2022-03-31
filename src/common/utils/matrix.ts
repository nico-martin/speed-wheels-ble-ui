const width = 11;
const height = 7;
export const matrix = Array(height).fill(Array(width).fill(0));
export type MatrixType = Array<Array<number>>;

const arrayToLength = (array, length, fill: any = 0) => {
  if (array.length > length) {
    array = array.slice(0, length);
  } else if (array.length < length) {
    array = [...array, ...Array(length - array.length).fill(fill)];
  }
  return array;
};

const fixedMatrixSize = (matrix, height, width) =>
  arrayToLength(matrix, height, []).map((row) => arrayToLength(row, width));

export const matrixToArray = (rows, height = 7, width = 17) => {
  const cleanSizeMatrix = fixedMatrixSize(rows, height, width);

  return cleanSizeMatrix.reduce(
    (acc, rows) => [...acc, ...rows.map((value) => value)],
    []
  );
};

export const setMatrixValue = (matrix: MatrixType, value: number) =>
  matrix.map((eRow) => eRow.map(() => value));

export const arrayToMatrix = (input, height = 7, width = 17) => {
  if (!input || input.length !== height * width) {
    return null;
  }

  return input.reduce((acc, item, index) => {
    const rowRaw = width / index;
    const row = isFinite(rowRaw) ? Math.floor(index / width) : 0;
    const col = index - width * row;

    if (!acc[row]) {
      acc[row] = [];
    }

    acc[row][col] = item;
    return acc;
  }, []);
};

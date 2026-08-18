/**
 * Matrix Operations and Validation Utilities
 * 
 * Functions for matrix padding, validation, and assignment normalization used in optimization algorithms.
 */

// Pads a rectangular cost matrix to a square matrix by filling empty cells with a large penalty value
export const padCostMatrixToSquare = ({
  matrix,
  rows,
  cols,
  bigM,
}: {
  matrix: number[][];
  rows: number;
  cols: number;
  bigM: number;
}) => {
  const n = Math.max(rows, cols);
  const padded = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => (r < rows && c < cols ? matrix[r][c] : bigM))
  );
  return { matrix: padded, rows, cols, bigM };
};

// Validates that all values in a 2D matrix are finite numbers, throwing an error if not
export const assertFinite2D = (matrix: number[][], name = "matrix"): void => {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error(`${name} is not a 2D array`);
  }
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!Number.isFinite(matrix[r][c])) {
        throw new Error(`${name}[${r}][${c}] is not finite: ${matrix[r][c]}`);
      }
    }
  }
};

// Checks if any value in the matrix is negative
export const hasNegative = (matrix: number[][]): boolean =>
  matrix.some((row) => row.some((v) => v < 0));

// Converts various assignment array formats to a consistent {rowIdx, colIdx} object array format
export const normalizeAssignment = (
  assign: any,
  rows: number,
  cols: number
): { rowIdx: number; colIdx: number }[] => {
  if (!assign) return [];
  if (Array.isArray(assign) && assign.length === rows && typeof assign[0] === "number") {
    return assign.map((colIdx: number, rowIdx: number) => ({ rowIdx, colIdx }));
  }
  if (Array.isArray(assign) && Array.isArray(assign[0])) {
    return assign.map(([r, c]: [number, number]) => ({ rowIdx: r, colIdx: c }));
  }
  if (Array.isArray(assign) && assign.length === cols && typeof assign[0] === "number") {
    return assign.map((rowIdx: number, colIdx: number) => ({ rowIdx, colIdx }));
  }
  return [];
};
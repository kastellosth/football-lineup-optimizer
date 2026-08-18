// Pads a rectangular matrix to a square matrix by filling with a high penalty value
export function padToSquare(matrix: number[][], padValue = 99999): number[][] {
  if (!matrix.length || !matrix[0]?.length) return [];

  const rows = matrix.length;
  const cols = matrix[0].length;
  const size = Math.max(rows, cols);

  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => {
      if (i < rows && j < cols) return matrix[i][j];
      return padValue;
    })
  );
}

export function hungarianAlgorithm(costMatrix: number[][]): number[] {
  if (!Array.isArray(costMatrix) || !costMatrix.length || !costMatrix[0]) {
    throw new Error("Invalid cost matrix passed to Hungarian algorithm");
  }

  const n = costMatrix.length;
  const u = Array(n + 1).fill(0);
  const v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0);
  const way = Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    const minv = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    let j0 = 0;

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;

      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }

      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const result = Array(n).fill(-1);
  for (let j = 1; j <= n; j++) {
    if (p[j] > 0 && p[j] <= n) result[p[j] - 1] = j - 1;
  }

  return result;
}
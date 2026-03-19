/**
 * Fuzzy matching utilities for entity disambiguation
 */

/**
 * Simple Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();

  if (al.length === 0) return bl.length;
  if (bl.length === 0) return al.length;

  const matrix: number[] = new Array(bl.length + 1);

  // Initialize first column
  for (let i = 0; i <= bl.length; i++) {
    matrix[i] = i;
  }

  // Fill the matrix
  for (let i = 1; i <= al.length; i++) {
    let prev = i;
    for (let j = 1; j <= bl.length; j++) {
      const matrixJMinus1 = matrix[j - 1]!;
      const matrixJ = matrix[j]!;
      const current =
        al.charAt(i - 1) === bl.charAt(j - 1) ? matrixJMinus1 : Math.min(matrixJMinus1 + 1, prev + 1, matrixJ + 1);
      matrix[j - 1] = prev;
      prev = current;
    }
    matrix[bl.length] = prev;
  }

  return matrix[bl.length]!;
}

/**
 * Normalized similarity score in [0, 1].
 * 1.0 = identical, 0.0 = completely different.
 */
export function similarity(a: string, b: string): number {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();

  if (al === bl) return 1.0;

  const dist = levenshtein(al, bl);
  const maxLength = Math.max(al.length, bl.length);
  return Math.max(0, 1 - dist / maxLength);
}

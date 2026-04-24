const PLACEHOLDER_NAMES = new Set([
  'www',
  'test',
  'abc',
  'aaa',
  'zzz',
  'unknown',
  'none',
  'null',
]);

export function isMeaningfulItemName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (normalized.length < 2) {
    return false;
  }

  // Must include at least one letter (Latin or CJK) to avoid purely numeric/symbol names.
  if (!/[a-z\u4e00-\u9fff]/i.test(normalized)) {
    return false;
  }

  // Reject obvious placeholders and repeated-letter strings such as "www" or "aaa".
  if (PLACEHOLDER_NAMES.has(normalized) || /^([a-z\u4e00-\u9fff])\1{2,}$/i.test(normalized)) {
    return false;
  }

  return true;
}

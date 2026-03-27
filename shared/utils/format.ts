/**
 * Formats a numeric string or number into a Turkish Lira currency format (thousands separator: .)
 */
export const formatCurrency = (val: string | number) => {
  const str = typeof val === 'number' ? val.toString() : val;
  // Remove all non-digits
  const clean = str.replace(/\D/g, "");
  if (!clean) return "";
  // Add dots as thousand separators
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Parses a currency string back to a number
 */
export const parseCurrency = (val: string): number => {
  const clean = val.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

/**
 * Basic money formatter for display (tr-TR locale)
 */
export const money = (n: number) => {
  try {
    return n.toLocaleString("tr-TR");
  } catch {
    return String(n);
  }
};

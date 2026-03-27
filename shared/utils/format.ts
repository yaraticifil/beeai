/**
 * Formats a numeric string or number into a Turkish Lira currency format (thousands separator: .)
 * Handles both integer and decimal input correctly for Turkish locale.
 */
export const formatCurrency = (val: string | number) => {
  let str = typeof val === 'number' ? val.toString().replace(".", ",") : val;
  if (!str) return "";

  // Check if it ends with a separator to allow user to continue typing decimals
  const endsWithSeparator = str.endsWith(",") || str.endsWith(".");

  // Find the last occurrence of a possible decimal separator
  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");
  const lastSeparatorIndex = Math.max(lastComma, lastDot);

  let integerPartStr = str;
  let decimalPartStr = "";

  // We assume it's a decimal separator if it's within the last 3 characters
  if (lastSeparatorIndex !== -1 && lastSeparatorIndex >= str.length - 3) {
    integerPartStr = str.substring(0, lastSeparatorIndex);
    decimalPartStr = str.substring(lastSeparatorIndex + 1).replace(/\D/g, "").slice(0, 2);
  }

  const integerPart = integerPartStr.replace(/\D/g, "");
  if (!integerPart && !decimalPartStr && !endsWithSeparator) return "";

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (endsWithSeparator && !decimalPartStr) {
    return `${formattedInteger},`;
  }

  return decimalPartStr !== "" ? `${formattedInteger},${decimalPartStr}` : formattedInteger;
};

/**
 * Parses a currency string back to a number
 * Turkish format: 1.250,50 -> 1250.50
 */
export const parseCurrency = (val: string): number => {
  if (!val) return 0;
  // Remove thousand dots and replace decimal comma with dot
  const clean = val.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

/**
 * Basic money formatter for display (tr-TR locale)
 */
export const money = (n: number) => {
  try {
    return n.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return String(n);
  }
};

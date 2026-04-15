/**
 * Formats a numeric value into a Turkish Lira currency string.
 * Example: 185000.5 -> "185.000,50"
 */
export const formatCurrency = (val: string) => {
  // Remove all non-digits except comma
  let clean = val.replace(/[^\d,]/g, "");
  if (!clean) return "";

  const parts = clean.split(",");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = parts[1] !== undefined ? "," + parts[1].slice(0, 2) : "";

  return integerPart + decimalPart;
};

/**
 * Parses a Turkish Lira currency string back into a numeric value.
 */
export const parseCurrency = (val: string): number => {
  if (!val) return 0;
  // Replace thousand separators (.) and convert decimal separator (,) to (.)
  const clean = val.replace(/\./g, "").replace(",", ".");
  return Number(clean);
};

/**
 * Formats a date string into DD.MM.YYYY format.
 */
export const formatDate = (val: string) => {
  const clean = val.replace(/\D/g, "").slice(0, 8);
  let output = "";
  if (clean.length > 0) {
    output += clean.slice(0, 2);
    if (clean.length > 2) {
      output += "." + clean.slice(2, 4);
      if (clean.length > 4) {
        output += "." + clean.slice(4, 8);
      }
    }
  }
  return output;
};

/**
 * Simple money formatter for display.
 */
export function money(n: number) {
  try {
    return n.toLocaleString("tr-TR");
  } catch {
    return String(n);
  }
}

/**
 * Formats a number into a compact Turkish Lira string (e.g., 1,2M, 450K).
 */
export function formatCompactNumber(num: number) {
  if (num >= 1000000) {
    const val = num / 1000000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)).replace(".", ",") + "M";
  }
  if (num >= 1000) {
    const val = num / 1000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)).replace(".", ",") + "K";
  }
  return String(num);
}

/**
 * Formats a numeric string or number into a Turkish Lira (TRY) currency format.
 * Uses dots for thousand separators and a comma for decimals.
 * Example: "1234.56" or 1234.56 -> "1.234,56"
 */
export function formatCurrency(val: string | number): string {
  if (val === undefined || val === null || val === "") return "";

  let clean: string;
  if (typeof val === "number") {
    clean = val.toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return clean;
  } else {
    // For input masking in text fields
    clean = val.replace(/[^\d,]/g, "");
    const parts = clean.split(",");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decimalPart = parts[1] !== undefined ? "," + parts[1].slice(0, 2) : "";
    return integerPart + decimalPart;
  }
}

/**
 * Parses a Turkish currency string (e.g., "1.250,50") back into a number.
 */
export function parseCurrency(val: string | number): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const normalized = val.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return isFinite(num) ? num : 0;
}

/**
 * Masks a string into DD.MM.YYYY date format.
 * Example: "31122025" -> "31.12.2025"
 */
export function formatDate(val: string): string {
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
}

/**
 * Standard money formatting for display labels.
 * Example: 12500 -> "12.500"
 */
export function money(n: number): string {
  try {
    return n.toLocaleString("tr-TR");
  } catch {
    return String(n);
  }
}

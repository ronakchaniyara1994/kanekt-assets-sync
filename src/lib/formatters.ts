/**
 * Formats a number into Indian Rupee currency format (e.g., ₹1,23,456.78)
 */
export function formatCurrency(amount: number | undefined | null, includeDecimals = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats large amounts into compact Indian terms (e.g. ₹1.45 Cr, ₹25.60 L)
 */
export function formatCompactCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    // Crore (1 Cr = 1,00,00,000)
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    // Lakh (1 L = 1,00,000)
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  } else if (abs >= 1000) {
    // Thousand
    return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  }
  return `${sign}₹${abs.toFixed(2)}`;
}

/**
 * Formats units with 3 decimal places (standard mutual fund precision)
 */
export function formatUnits(units: number | undefined | null): string {
  if (units === undefined || units === null || isNaN(units)) {
    return '0.000';
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(units);
}

/**
 * Formats NAV with up to 4 decimal places
 */
export function formatNav(nav: number | undefined | null): string {
  if (nav === undefined || nav === null || isNaN(nav)) {
    return '0.0000';
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(nav);
}

/**
 * Formats date string cleanly
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'N/A';
  return dateStr;
}

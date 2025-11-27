// lib/bankBarcode.js

// Clean "FI58 1017 1000 0001 22" → "5810171000000122"
function getIbanNumericPart(iban) {
  if (!iban) {
    throw new Error('IBAN is required for pankkiviivakoodi');
  }
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  if (!clean.startsWith('FI')) {
    throw new Error(`Pankkiviivakoodi is only defined for FI IBANs, got: ${clean}`);
  }
  const numeric = clean.slice(2);
  if (numeric.length !== 16 || !/^\d+$/.test(numeric)) {
    throw new Error(`FI IBAN numeric part must be 16 digits, got "${numeric}"`);
  }
  return numeric;
}

// Convert amount (number or string) to euro/cents strings
function formatAmountParts(amount) {
  if (amount == null) {
    return { euros: '000000', cents: '00' };
  }
  const centsTotal = Math.round(Number(amount) * 100);
  const euros = Math.floor(centsTotal / 100)
    .toString()
    .padStart(6, '0');
  const cents = (centsTotal % 100).toString().padStart(2, '0');
  return { euros, cents };
}

// YYMMDD from Date or string; supports "YYYY-MM-DD" or "YYYYMMDD"
function formatDueDate(dueDate) {
  if (!dueDate) return '000000';

  if (dueDate instanceof Date) {
    if (Number.isNaN(dueDate.getTime())) return '000000';
    const year = dueDate.getFullYear().toString().slice(-2);
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  const s = String(dueDate).trim();

  // "YYYYMMDD"
  if (/^\d{8}$/.test(s)) {
    const yyyy = s.slice(0, 4);
    const mm = s.slice(4, 6);
    const dd = s.slice(6, 8);
    return `${yyyy.slice(-2)}${mm}${dd}`;
  }

  // "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [yyyy, mm, dd] = s.split('-');
    return `${yyyy.slice(-2)}${mm}${dd}`;
  }

  // Fallback: try Date
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '000000';
  const year = d.getFullYear().toString().slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// National reference → 20 digits, left-padded with zeros
function formatNationalRef(ref) {
  if (ref == null) throw new Error('Reference is required');
  const clean = String(ref).replace(/\s+/g, '');
  if (!/^\d+$/.test(clean)) {
    throw new Error(`National reference must be digits only, got "${clean}"`);
  }
  return clean.padStart(20, '0');
}

// RF reference ("RFxx...") → 23-digit numeric part
function formatRfRef(ref) {
  const clean = String(ref).replace(/\s+/g, '').toUpperCase();
  if (!clean.startsWith('RF')) {
    throw new Error(`RF reference must start with RF, got "${clean}"`);
  }
  const numeric = clean.slice(2);
  if (!/^\d+$/.test(numeric)) {
    throw new Error(`RF numeric part must be digits only, got "${numeric}"`);
  }

  const checksum = numeric.slice(0, 2);
  const rest = numeric.slice(2);

  const neededZeros = 23 - (2 + rest.length);
  const zeros = '0'.repeat(Math.max(0, neededZeros));
  return checksum + zeros + rest;
}

/**
 * Build the 54-digit pankkiviivakoodi data string.
 * - iban: "FI58 1017 1000 0001 22"
 * - amount: number (e.g. 482.99)
 * - reference: "12345..." (national) or "RF06..."
 * - dueDate: Date, "YYYY-MM-DD", or "YYYYMMDD" (optional)
 */
export function buildFinnishBankBarcode({ iban, amount, reference, dueDate }) {
  const ibanNumeric = getIbanNumericPart(iban);
  const { euros, cents } = formatAmountParts(amount);
  const due = formatDueDate(dueDate);

  const isRf = /^RF/i.test(String(reference));

  let data;

  if (isRf) {
    const version = '5';
    const rfPart = formatRfRef(reference);
    data = version + ibanNumeric + euros + cents + rfPart + due;
  } else {
    const version = '4';
    const nationalRef = formatNationalRef(reference);
    const reserved = '000';
    data = version + ibanNumeric + euros + cents + reserved + nationalRef + due;
  }

  if (!/^\d+$/.test(data)) {
    throw new Error(`Pankkiviivakoodi must be digits only, got "${data}"`);
  }
  if (data.length !== 54) {
    throw new Error(
      `Pankkiviivakoodi must be 54 digits, got length ${data.length} ("${data}")`
    );
  }

  return data;
}

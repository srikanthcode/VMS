// Server-side phone validation
// Accepts national number or full number with country code / leading 0
// Default expected national length is 10 (India). Country code map for others.

const COUNTRY_PHONE_LENGTHS = {
  '91': 10,   // India
  '1': 10,    // USA/Canada
  '44': 10,   // UK
  '971': 9,   // UAE
  '61': 9,    // Australia
  '65': 8,    // Singapore
  '86': 11,   // China
  '81': 10,   // Japan
  '49': 10,   // Germany
  '33': 9,    // France
  '880': 10,  // Bangladesh
  '94': 9,    // Sri Lanka
  '92': 10    // Pakistan
};

const getNationalDigits = (phone) => {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  // Try longest known country codes first
  const codes = Object.keys(COUNTRY_PHONE_LENGTHS).sort((a, b) => b.length - a.length);
  for (const cc of codes) {
    if (digits.length > cc.length && digits.startsWith(cc)) {
      const rest = digits.slice(cc.length);
      const expected = COUNTRY_PHONE_LENGTHS[cc];
      if (rest.length === expected) return rest;
    }
  }
  // Strip leading 0 (national trunk prefix)
  if (digits.length > 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

const isValidPhone = (phone, countryCode = '') => {
  if (!phone) return false;
  let national = getNationalDigits(phone);
  // If explicit country code provided and digits still include it
  const cc = String(countryCode).replace(/\D/g, '');
  if (cc && national.startsWith(cc) && national.length > cc.length) {
    national = national.slice(cc.length);
  }
  const expected = (cc && COUNTRY_PHONE_LENGTHS[cc]) || 10;
  return national.length === expected && /^\d+$/.test(national);
};

const normalizePhone = (phone, countryCode = '') => {
  let national = getNationalDigits(phone);
  const cc = String(countryCode).replace(/\D/g, '');
  if (cc && national.startsWith(cc) && national.length > cc.length) {
    national = national.slice(cc.length);
  }
  return national;
};

module.exports = { isValidPhone, normalizePhone, getNationalDigits, COUNTRY_PHONE_LENGTHS };

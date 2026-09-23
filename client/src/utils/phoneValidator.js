// Client-side phone validation with country codes
// Real-time validation based on selected country code

export const COUNTRY_CODES = [
  { code: '+91', country: 'IN', name: 'India', length: 10 },
  { code: '+1', country: 'US', name: 'USA', length: 10 },
  { code: '+44', country: 'UK', name: 'UK', length: 10 },
  { code: '+971', country: 'AE', name: 'UAE', length: 9 },
  { code: '+61', country: 'AU', name: 'Australia', length: 9 },
  { code: '+65', country: 'SG', name: 'Singapore', length: 8 },
  { code: '+86', country: 'CN', name: 'China', length: 11 },
  { code: '+81', country: 'JP', name: 'Japan', length: 10 },
  { code: '+49', country: 'DE', name: 'Germany', length: 10 },
  { code: '+33', country: 'FR', name: 'France', length: 9 },
  { code: '+91', country: 'IN', name: 'Nepal', length: 10, alt: true },
  { code: '+880', country: 'BD', name: 'Bangladesh', length: 10 },
  { code: '+94', country: 'LK', name: 'Sri Lanka', length: 9 },
  { code: '+92', country: 'PK', name: 'Pakistan', length: 10 }
];

export const getCountryInfo = (code) =>
  COUNTRY_CODES.find(c => c.code === code && !c.alt) || COUNTRY_CODES[0];

export const getExpectedLength = (code) => getCountryInfo(code).length;

// Strip country code and leading 0, return national number digits
export const getNationalDigits = (phone, countryCode = '') => {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  const cc = String(countryCode).replace(/\D/g, '');
  if (cc && digits.startsWith(cc) && digits.length > cc.length) {
    digits = digits.slice(cc.length);
  } else if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length > 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

export const isValidPhone = (phone, countryCode = '') => {
  if (!phone) return false;
  const expected = getExpectedLength(countryCode);
  const national = getNationalDigits(phone, countryCode);
  return national.length === expected && /^\d+$/.test(national);
};

export const normalizePhone = (phone, countryCode = '') => {
  return getNationalDigits(phone, countryCode);
};

// Real-time error: returns message while typing, empty when valid
// showRequired=false while typing so empty field doesn't scream until blur/submit
export const getPhoneError = (phone, countryCode = '', { showRequired = true } = {}) => {
  const expected = getExpectedLength(countryCode);
  if (!phone || !String(phone).trim()) {
    return showRequired ? 'Phone number is required' : '';
  }
  const national = getNationalDigits(phone, countryCode);
  if (!/^\d+$/.test(national)) {
    return 'Phone number must contain only digits';
  }
  if (national.length < expected) {
    return `${expected} digits required - ${national.length} entered (${expected - national.length} more)`;
  }
  if (national.length > expected) {
    return `Too many digits - ${national.length} entered, only ${expected} allowed`;
  }
  return '';
};

// Live feedback helper for character counter
export const getPhoneStatus = (phone, countryCode = '') => {
  const expected = getExpectedLength(countryCode);
  const national = getNationalDigits(phone, countryCode);
  const current = national.length;
  if (current === 0) return { current: 0, expected, valid: false, color: 'muted' };
  if (current < expected) return { current, expected, valid: false, color: 'warning' };
  if (current === expected) return { current, expected, valid: true, color: 'success' };
  return { current, expected, valid: false, color: 'danger' };
};

export function validatePasswordStrength(value: string) {
  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };

  const valid = Object.values(checks).every(Boolean);
  return { valid, checks };
}

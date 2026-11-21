export type PasswordCheck = {
  longEnough: boolean;
  lower: boolean;
  upper: boolean;
  number: boolean;
  special: boolean;
  typesMet: number;
  valid: boolean;
};

export const checkPassword = (password: string): PasswordCheck => {
  const longEnough = password.length >= 8;
  const lower = /[a-z]/.test(password);
  const upper = /[A-Z]/.test(password);
  const number = /[0-9]/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);
  const typesMet = [lower, upper, number, special].filter(Boolean).length;

  return {
    longEnough,
    lower,
    upper,
    number,
    special,
    typesMet,
    valid: longEnough && typesMet >= 3,
  };
};
module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-console': 'warn',
    // Every date this app shows must be Jalali (شمسی) — never Gregorian, in
    // any language. These are the native Gregorian date formatters, and that
    // includes `toLocaleDateString('fa-IR')`: it only yields a Jalali date
    // when the engine ships a full Intl/ICU (Hermes on Android doesn't
    // guarantee it) and silently falls back to Gregorian when it doesn't.
    // Use formatJalaliDate() from src/utiles/date.ts instead.
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'CallExpression > MemberExpression.callee[property.name=/^(toLocaleDateString|toLocaleTimeString|toDateString|toUTCString)$/]',
        message:
          'Dates must be shown in Jalali — use formatJalaliDate() from src/utiles/date.ts, not a native Gregorian formatter.',
      },
    ],
  },
};

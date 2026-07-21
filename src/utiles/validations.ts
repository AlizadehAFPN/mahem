export const mobileValidation = mobile => {
  // Must match the backend's exact format (src/auth/dto/*.ts: ^09\d{9}$) —
  // otherwise input that passes client validation can still get a 400 here.
  var regex = new RegExp('^09\\d{9}$');
  return regex.test(mobile);
};

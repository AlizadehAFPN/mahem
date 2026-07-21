// Backend errors are shaped `{statusCode, message, error}` where `message`
// can be a single string or an array of validation messages.
export function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) {
    return message.join('\n');
  }
  if (typeof message === 'string') {
    return message;
  }
  return 'خطایی رخ داد، لطفا دوباره تلاش کنید';
}

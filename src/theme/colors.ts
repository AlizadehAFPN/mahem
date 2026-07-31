import {pallete} from './pallete';

export const colors = {
  pallete,
  main: pallete.red,
  background: 'white',
  text: 'black',
  error: pallete.red,

  // Both of these were referenced across the app but never defined here, so
  // every read of them produced `undefined` — and neither failure announced
  // itself:
  //
  //  - `colors.transparent` is passed as TextField's underlineColorAndroid.
  //    `undefined` there is not "no underline", it is "use the default", so
  //    Android drew its native underline beneath every text input in the app.
  //  - `colors.darkGray` is the border of Checkbox's outline and TextField's
  //    default border. With `undefined`, React Native falls back to a black
  //    border rather than the intended grey.
  transparent: 'transparent',
  darkGray: pallete.gray2,
};

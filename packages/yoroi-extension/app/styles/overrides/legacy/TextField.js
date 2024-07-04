// @flow

/* It's important to understand that the text field is a
  simple abstraction on top of
  - FormControl
  - InputLabel
  - OutlinedInput
  - FormHelperText
*/
const ClassicTextField = {
  defaultProps: {
    variant: 'outlined',
    fullWidth: true,
  },
};
const ModernTextField = {
  defaultProps: {
    variant: 'outlined',
    fullWidth: true,
  },
};

export { ClassicTextField, ModernTextField };

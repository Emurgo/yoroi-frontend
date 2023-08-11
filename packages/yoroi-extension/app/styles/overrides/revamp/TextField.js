// @flow

/* It's important to understand that the text field is a
  simple abstraction on top of
  - FormControl
  - InputLabel
  - OutlinedInput
  - FormHelperText
*/
const RevampTextField = {
  defaultProps: {
    variant: 'outlined',
    fullWidth: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      '.MuiFormHelperText-root': {
        fontSize: '0.75rem',
        '&.Mui-error': {
          color: theme.palette.magenta[500],
        },
      },
    }),
  },
};

export { RevampTextField };

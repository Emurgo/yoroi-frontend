// @flow

import { asImportant } from '../../utils';

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
    // $FlowFixMe
    root: ({ theme }) => ({
      margin: '8px 0px',
      '.MuiFormHelperText-root': {
        fontSize: '0.75rem',
        '&.Mui-error': {
          color: theme.palette.magenta[500],
        },
      },
      '.MuiOutlinedInput-input.Mui-disabled': {
        color: asImportant(theme.palette.common.black),
        WebkitTextFillColor: asImportant(theme.palette.common.black),
      },
      '.MuiOutlinedInput-root.Mui-disabled': {
        backgroundColor: theme.palette.grayscale[50],
      },
      '.MuiInputLabel-root.Mui-disabled': {
        color: theme.palette.grayscale[900],
        backgroundColor: theme.palette.common.white,
      },
    }),
  },
};

export { RevampTextField };

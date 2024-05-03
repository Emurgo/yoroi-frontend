// @flow

import { asImportant } from '../utils';

/* It's important to understand that the text field is a
  simple abstraction on top of
  - FormControl
  - InputLabel
  - OutlinedInput
  - FormHelperText
*/
const TextField = {
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
          color: theme.palette.ds.sys_magenta_c500,
        },
      },
      '.MuiOutlinedInput-input.Mui-disabled': {
        color: asImportant(theme.palette.ds.gray_cmax),
        WebkitTextFillColor: asImportant(theme.palette.ds.gray_cmax),
      },
      '.MuiOutlinedInput-root.Mui-disabled': {
        backgroundColor: theme.palette.ds.gray_c50,
      },
      '.MuiInputLabel-root.Mui-disabled': {
        color: theme.palette.ds.gray_cmax,
        backgroundColor: theme.palette.ds.gray_cmin,
      },
      '& .MuiInputLabel-root': {
        color: theme.palette.ds.gray_c600,
      },
    }),
  },
};

export { TextField };

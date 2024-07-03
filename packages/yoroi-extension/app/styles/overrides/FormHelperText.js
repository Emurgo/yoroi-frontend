// @flow

const FormHelperText = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      color: theme.palette.ds.gray_c600,
      fontSize: '0.75rem',
      '&.Mui-disabled': { color: theme.palette.ds.gray_c200 },
      '&.Mui-error': { color: theme.palette.ds.sys_magenta_c500 },
    }),
  },
  defaultProps: { variant: 'outlined' },
};
export { FormHelperText };

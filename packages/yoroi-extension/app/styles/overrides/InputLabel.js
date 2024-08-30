// @flow

const InputLabel = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      color: theme.palette.ds.gray_c900,
      lineHeight: '24px',
      '&::first-letter': { textTransform: 'uppercase' },
      '&.Mui-focused': { color: theme.palette.ds.gray_c900 },
      '&.Mui-disabled': { color: theme.palette.ds.gray_c200 },
      '&.Mui-error': { color: theme.palette.ds.sys_magenta_c500 },
    }),
  },
  defaultProps: { variant: 'outlined' },
};

export { InputLabel };

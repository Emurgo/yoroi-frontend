// @flow

const InputLabel = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      color: theme.palette.ds.gray_900,
      lineHeight: '24px',
      '&::first-letter': { textTransform: 'uppercase' },
      '&.Mui-focused': { color: theme.palette.ds.gray_900 },
      '&.Mui-disabled': { color: theme.palette.ds.gray_200 },
      '&.Mui-error': { color: theme.palette.ds.sys_magenta_500 },
    }),
  },
  defaultProps: { variant: 'outlined' },
};

export { InputLabel };

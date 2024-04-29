// @flow

const FormHelperText = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      color: theme.palette.grayscale[600],
      fontSize: '0.75rem',
      '&.Mui-disabled': { color: theme.palette.grayscale[200] },
      '&.Mui-error': { color: theme.palette.magenta[500] },
    }),
  },
  defaultProps: { variant: 'outlined' },
};
export { FormHelperText };

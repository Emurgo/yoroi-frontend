// @flow

const InputLabel = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      color: theme.palette.grayscale[900],
      lineHeight: '24px',
      '&::first-letter': { textTransform: 'uppercase' },
      '&.Mui-focused': { color: theme.palette.grayscale[900] },
      '&.Mui-disabled': { color: theme.palette.grayscale[200] },
      '&.Mui-error': { color: theme.palette.system.magenta[500] },
    }),
  },
  defaultProps: { variant: 'outlined' },
};

export { InputLabel };

// @flow

const RevampInputLabel = {
  styleOverrides: {
    // $FlowFixMe
    root: ({ theme }) => ({
      color: theme.palette.grayscale[400],
      '&::first-letter': { textTransform: 'uppercase' },
      '&.Mui-focused': { color: theme.palette.grayscale[900] },
      '&.Mui-disabled': { color: theme.palette.grayscale[200] },
      '&.Mui-error': { color: theme.palette.magenta[500] },
    }),
  },
  defaultProps: { variant: 'outlined' },
};

export { RevampInputLabel };

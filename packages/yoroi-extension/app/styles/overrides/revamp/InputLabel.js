// @flow

const RevampInputLabel = {
  styleOverrides: {
    root: {
      color: 'grayscale.400',
      '&::first-letter': { textTransform: 'uppercase' },
      '&.Mui-focused': { color: 'grayscale.900' },
      '&.Mui-disabled': { color: 'grayscale.200' },
      '&.Mui-error': { color: 'magenta.500' },
    },
  },
  defaultProps: { variant: 'outlined' },
};

export { RevampInputLabel };

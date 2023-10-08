// @flow

const RevampFormHelperText = {
  styleOverrides: {
    root: {
      color: 'grayscale.600',
      marginTop: 0,
      marginLeft: '14px',
      fontWeight: 400,
      position: 'absolute',
      bottom: '-2px',
      '&.Mui-disabled': { color: 'grayscale.200' },
      '&.Mui-error': { color: 'magenta.500' },
    },
  },
  defaultProps: { variant: 'outlined' },
};
export { RevampFormHelperText };

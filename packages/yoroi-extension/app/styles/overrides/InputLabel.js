// @flow
const ClassicInputLabel = {
  styleOverrides: {
    root: {
      color: 'var(--mui-input-placeholder-color)',
      marginTop: '-45px',
      left: '-12px',
      letterSpacing: '1.12px',
      fontWeight: 500,
    },
  },
  defaultProps: {
    variant: 'outlined',
    shrink: false,
  },
};
const ModernInputLabel = {
  styleOverrides: {
    root: {
      color: 'var(--mui-input-placeholder-color)',
    },
  },
  defaultProps: {
    variant: 'outlined',
  },
};

export { ClassicInputLabel, ModernInputLabel };

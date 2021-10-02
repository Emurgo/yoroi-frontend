// @flow
const ClassicInputLabel = {
  styleOverrides: {
    root: {
      color: 'var(--component-input-placeholder)',
      top: '-30px',
      letterSpacing: '1.12px',
      fontWeight: 500,
      transform: 'none',
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
      color: 'var(--component-input-placeholder)',
    },
  },
  defaultProps: {
    variant: 'outlined',
  },
};

export { ClassicInputLabel, ModernInputLabel };

// @flow
const ClassicInputLabel = {
  styleOverrides: {
    root: {
      color: 'var(--component-input-placeholder)',
      position: 'relative',
      top: 'unset',
      transform: 'none',
      marginBottom: '10px',
      letterSpacing: '1.12px',
      fontWeight: 500,
      '&.Mui-focused': {
        color: 'var(--component-input-text-focus)',
      },
      '&.Mui-disabled': {
        color: 'var(--component-input-placeholder-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--component-input-error)',
      },
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
      '&.Mui-focused': {
        color: 'var(--component-input-text-focus)',
      },
      '&.Mui-disabled': {
        color: 'var(--component-input-placeholder-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--component-input-error)',
      },
      '&.MuiInputLabel-shrink': {
        padding: '0 6px',
        background: 'var(--th-palette-common-white)',
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
  },
};

export { ClassicInputLabel, ModernInputLabel };

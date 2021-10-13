// @flow
const ClassicInputLabel = {
  styleOverrides: {
    root: {
      color: 'var(--yoroi-comp-input-placeholder)',
      position: 'relative',
      top: 'unset',
      transform: 'none',
      marginBottom: '10px',
      letterSpacing: '1.12px',
      fontWeight: 500,
      '&.Mui-focused': {
        color: 'var(--yoroi-comp-input-text-focus)',
      },
      '&.Mui-disabled': {
        color: 'var(--yoroi-comp-input-placeholder-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--yoroi-comp-input-error)',
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
      color: 'var(--yoroi-comp-input-placeholder)',
      '&.Mui-focused': {
        color: 'var(--yoroi-comp-input-text-focus)',
      },
      '&.Mui-disabled': {
        color: 'var(--yoroi-comp-input-placeholder-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--yoroi-comp-input-error)',
      },
      '&.MuiInputLabel-shrink': {
        padding: '0 6px',
        background: 'var(--yoroi-palette-common-white)',
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
  },
};

export { ClassicInputLabel, ModernInputLabel };

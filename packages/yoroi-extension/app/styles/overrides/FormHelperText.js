// @flow
const ClassicFormHelperText = {
  styleOverrides: {
    root: {
      color: 'var(--yoroi-comp-input-helper-text)',
      marginLeft: 0,
      marginTop: 0,
      fontWeight: 400,
      position: 'absolute',
      bottom: '-2px',
      '&.Mui-disabled': {
        color: 'var(--yoroi-comp-input-helper-text-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--yoroi-comp-input-error)',
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
  },
};
const ModernFormHelperText = {
  styleOverrides: {
    root: {
      color: 'var(--yoroi-comp-input-helper-text)',
      marginTop: 0,
      marginLeft: '14px',
      fontWeight: 400,
      position: 'absolute',
      bottom: '-2px',
      '&.Mui-disabled': {
        color: 'var(--yoroi-comp-input-helper-text-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--yoroi-comp-input-error)',
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
  },
};
export { ClassicFormHelperText, ModernFormHelperText };

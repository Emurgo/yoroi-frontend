// @flow
const ClassicFormHelperText = {
  styleOverrides: {
    root: {
      color: 'var(--component-input-helper-text)',
      marginLeft: 0,
      marginTop: 0,
      fontWeight: 400,
      position: 'absolute',
      bottom: '-2px',
      '&.Mui-disabled': {
        color: 'var(--component-input-helper-text-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--component-input-error)',
      },
    },
  },
};
const ModernFormHelperText = {
  styleOverrides: {
    root: {
      color: 'var(--component-input-helper-text)',
      marginTop: 0,
      marginLeft: '14px',
      fontWeight: 400,
      position: 'absolute',
      bottom: '-2px',
      '&.Mui-disabled': {
        color: 'var(--component-input-helper-text-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--component-input-error)',
      },
    },
  },
};
export { ClassicFormHelperText, ModernFormHelperText };

// @flow
const ClassicFormControl = {
  styleOverrides: {
    root: {
      paddingBottom: '20px',
      marginBottom: '10px',
    },
  },
  defaultProps: {
    variant: 'outlined',
    fullWidth: true,
  },
};

const ModernFormControl = {
  styleOverrides: {
    root: {
      paddingBottom: '20px',
      marginBottom: '10px',
      marginTop: '7px',
      '&:hover': {
        '& .MuiInputLabel-root': {
          color: 'var(--component-input-text-focus)',
          '&.Mui-disabled': {
            color: 'var(--component-input-border-disabled)',
          },
          '&.Mui-error': {
            color: 'var(--component-input-error)',
          },
        },
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
    fullWidth: true,
  },
};

export { ClassicFormControl, ModernFormControl };

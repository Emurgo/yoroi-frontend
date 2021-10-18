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
          color: 'var(--yoroi-comp-input-text-focus)',
          '&.Mui-disabled': {
            color: 'var(--yoroi-comp-input-border-disabled)',
          },
          '&.Mui-error': {
            color: 'var(--yoroi-comp-input-error)',
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

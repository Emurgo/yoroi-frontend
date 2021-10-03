// @flow

/* It's important to understand that the text field is a
  simple abstraction on top of
  - FormControl
  - InputLabel
  - OutlinedInput
  - FormHelperText
*/
const ClassicTextField = {
  styleOverrides: {
    root: {
      width: '100%',
      borderColor: 'var(--component-input-border)',
      marginTop: '24px',
      '& .MuiSelect-select': {
        backgroundColor: 'white',
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
  },
};
const ModernTextField = {
  styleOverrides: {
    root: {
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
      '& .MuiSelect-select': {
        borderRadius: 8,
        backgroundColor: 'white',
      },
    },
  },

  defaultProps: {
    variant: 'outlined',
  },
};

export { ClassicTextField, ModernTextField };

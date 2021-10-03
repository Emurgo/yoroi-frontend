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
      '& .MuiFormHelperText-root': {
        color: 'var(--component-input-helper-text)',
        marginLeft: 0,
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
      '& .MuiFormHelperText-root': {
        color: 'var(--component-input-helper-text)',
        letterSpacing: '0.4px',
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
  },

  defaultProps: {
    variant: 'outlined',
  },
};

export { ClassicTextField, ModernTextField };

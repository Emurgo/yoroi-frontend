// @flow
const ClassicTextField = {
  styleOverrides: {
    root: {
      width: '100%',
      borderColor: 'var(--component-input-border)',
      marginTop: '24px',
      '& .MuiInputLabel-root': {
        color: 'var(--component-input-placeholder)',
        position: 'relative',
        top: 'unset',
        marginBottom: '10px',
        letterSpacing: '1.12px',
        fontWeight: 500,
        '&.Mui-focused': {
          color: 'var(--component-input-text)',
        },
        '&.Mui-disabled': {
          color: 'var(--component-input-placeholder-disabled)',
        },
        '&.Mui-error': {
          color: 'var(--component-input-error)',
        },
      },
      '& .MuiInputBase-input ': {
        height: '1.2em',
      },
      '& .MuiOutlinedInput-root': {
        paddingRight: '16px',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-border)',
          borderRadius: 0,
          backgroundColor: 'var(--component-input-background)',
          letterSpacing: 'initial',
        },
        '& svg': {
          color: 'var(--component-input-border)',
        },
        '&.Mui-focused svg': {
          color: 'var(--component-input-helper-text)',
        },
        '&.Mui-disabled svg': {
          color: 'var(--component-input-border-disabled)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-border-focus)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-border-focus)',
        },

        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-border-disabled)',
          backgroundColor: 'var(--component-input-background-disabled)',
          color: 'var(--component-input-text-disabled)',
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-error)',
        },
      },
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
        },
      },
      '& .MuiInputLabel-root': {
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
      },

      '& .MuiOutlinedInput-input': {
        '&.Mui-disabled': {
          color: 'var(--component-input-text-disabled)',
          WebkitTextFillColor: 'var(--component-input-text-disabled)',
        },
      },
      '& .MuiOutlinedInput-root': {
        paddingRight: '16px',
        height: '56px',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-border-focus)',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-border)',
          borderRadius: 8,
          backgroundColor: 'var(--component-input-background)',
          letterSpacing: 'initial',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-border-focus)',
          border: '2px solid',
        },
        '& svg': {
          color: 'var(--component-input-border)',
        },
        '&.Mui-focused svg': {
          color: 'var(--component-input-helper-text)',
        },
        '&.Mui-disabled svg': {
          color: 'var(--component-input-border-disabled)',
        },
        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-border-disabled)',
          backgroundColor: 'var(--component-input-background-disabled)',
          color: 'var(--component-input-text-disabled)',
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--component-input-error)',
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

// @flow
const ClassicTextField = {
  styleOverrides: {
    root: {
      // minWidth: 400,
      width: '100%',
      borderColor: 'var(--mui-input-border-color)',
      marginTop: '24px',
      '& label': {
        color: 'var(--mui-input-placeholder-color)',
        position: 'relative',
        top: 'unset',
        marginBottom: '10px',
        letterSpacing: '1.12px',
        fontWeight: 500,
      },
      '& label.Mui-focused': {
        color: 'var(--mui-input-text-color)',
      },
      '& label.Mui-disabled': {
        color: 'var(--mui-input-placeholder-color-disabled)',
      },
      '& label.Mui-error': {
        color: 'var(--mui-input-border-color-error)',
      },
      '& .MuiInputBase-input ': {
        height: '1.2em',
      },
      '& .MuiOutlinedInput-root': {
        paddingRight: '16px',
        '& fieldset': {
          borderColor: 'var(--mui-input-border-color)',
          borderRadius: 0,
          backgroundColor: 'var(--mui-input-bg-color)',
        },
        '&:hover fieldset': {
          borderColor: 'var(--mui-input-border-color-focus)',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'var(--mui-input-border-color-focus)',
        },
        '&.Mui-disabled fieldset': {
          borderColor: 'var(--mui-input-border-color-disabled)',
          backgroundColor: 'var(--mui-input-bg-color-disabled)',
          color: 'var(--mui-input-text-color-disabled)',
        },
        '&.Mui-error fieldset': {
          borderColor: 'var(--mui-input-border-color-error)',
        },
      },
      '& .MuiSelect-select': {
        backgroundColor: 'white',
      },
      '& .MuiFormHelperText-root': {
        marginLeft: 0,
        fontWeight: 400,
        position: 'absolute',
        bottom: '-2px',
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
    InputLabelProps: {
      shrink: false,
    },
  },
};
const ModernTextField = {
  styleOverrides: {
    root: {
      minWidth: 400,
      borderColor: 'var(--mui-input-border-color)',
      '& label': {
        color: 'var(--mui-input-placeholder-color)',
      },
      '& label.Mui-focused': {
        color: 'var(--mui-input-text-color)',
      },
      '& label.Mui-disabled': {
        color: 'var(--mui-input-placeholder-color-disabled)',
      },
      '& label.Mui-error': {
        color: 'var(--mui-input-border-color-error)',
      },
      '& .MuiInputBase-input ': {
        height: '1.2em',
      },
      '& .MuiOutlinedInput-root': {
        paddingRight: '16px',
        '& fieldset': {
          borderColor: 'var(--mui-input-border-color)',
          borderRadius: 8,
          backgroundColor: 'var(--mui-input-bg-color)',
        },
        '&:hover fieldset': {
          borderColor: 'var(--mui-input-border-color-focus)',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'var(--mui-input-border-color-focus)',
        },
        '&.Mui-disabled fieldset': {
          borderColor: 'var(--mui-input-border-color-disabled)',
          backgroundColor: 'var(--mui-input-bg-color-disabled)',
          color: 'var(--mui-input-text-color-disabled)',
        },
        '&.Mui-error fieldset': {
          borderColor: 'var(--mui-input-border-color-error)',
        },
      },
      '& .MuiSelect-select': {
        borderRadius: 8,
        backgroundColor: 'white',
      },
      '& .MuiFormHelperText-root': {
        letterSpacing: '0.4px',
        marginLeft: 0,
        fontWeight: 400,
        position: 'absolute',
        bottom: '-2px',
      },
    },
  },

  defaultProps: {
    variant: 'outlined',
  },
};

export { ClassicTextField, ModernTextField };

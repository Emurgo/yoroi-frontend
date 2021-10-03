// @flow
const ClassicOutlinedInput = {
  styleOverrides: {
    root: {
      paddingRight: '16px',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--component-input-border)',
        borderRadius: 0,
        backgroundColor: 'var(--component-input-background)',
        letterSpacing: 'initial',
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
      '& .MuiOutlinedInput-input': {
        height: '1.2em',
        '&.Mui-disabled': {
          color: 'var(--component-input-text-disabled)',
          WebkitTextFillColor: 'var(--component-input-text-disabled)',
        },
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
    },
  },
};
const ModernOutlinedInput = {
  styleOverrides: {
    root: {
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
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--component-input-border-disabled)',
        backgroundColor: 'var(--component-input-background-disabled)',
        color: 'var(--component-input-text-disabled)',
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--component-input-error)',
      },
      '& .MuiOutlinedInput-input': {
        '&.Mui-disabled': {
          color: 'var(--component-input-text-disabled)',
          WebkitTextFillColor: 'var(--component-input-text-disabled)',
        },
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
    },
  },
};
export { ClassicOutlinedInput, ModernOutlinedInput };

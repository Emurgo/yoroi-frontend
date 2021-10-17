// @flow
const ClassicOutlinedInput = {
  styleOverrides: {
    root: {
      paddingRight: '16px',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-border)',
        borderRadius: 0,
        backgroundColor: 'var(--yoroi-comp-input-background)',
        letterSpacing: 'initial',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-border-focus)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-border-focus)',
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-border-disabled)',
        backgroundColor: 'var(--yoroi-comp-input-background-disabled)',
        color: 'var(--yoroi-comp-input-text-disabled)',
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-error)',
      },
      '& .MuiOutlinedInput-input': {
        height: '1.2em',
        '&.Mui-disabled': {
          color: 'var(--yoroi-comp-input-text-disabled)',
          WebkitTextFillColor: 'var(--yoroi-comp-input-text-disabled)',
        },
      },
      '& svg': {
        color: 'var(--yoroi-comp-input-border)',
      },
      '&.Mui-focused svg': {
        color: 'var(--yoroi-comp-input-helper-text)',
      },
      '&.Mui-disabled svg': {
        color: 'var(--yoroi-comp-input-border-disabled)',
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
        borderColor: 'var(--yoroi-comp-input-border-focus)',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-border)',
        borderRadius: 8,
        backgroundColor: 'var(--yoroi-comp-input-background)',
        letterSpacing: 'initial',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-border-focus)',
        border: '2px solid',
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-border-disabled)',
        backgroundColor: 'var(--yoroi-comp-input-background-disabled)',
        color: 'var(--yoroi-comp-input-text-disabled)',
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--yoroi-comp-input-error)',
      },
      '& .MuiOutlinedInput-input': {
        '&.Mui-disabled': {
          color: 'var(--yoroi-comp-input-text-disabled)',
          WebkitTextFillColor: 'var(--yoroi-comp-input-text-disabled)',
        },
      },
      '& svg': {
        color: 'var(--yoroi-comp-input-border)',
      },
      '&.Mui-focused svg': {
        color: 'var(--yoroi-comp-input-helper-text)',
      },
      '&.Mui-disabled svg': {
        color: 'var(--yoroi-comp-input-border-disabled)',
      },
    },
  },
};
export { ClassicOutlinedInput, ModernOutlinedInput };

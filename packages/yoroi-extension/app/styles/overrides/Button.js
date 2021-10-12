// @flow

const ClassicButton = {
  styleOverrides: {
    root: {
      fontSize: '0.875rem',
      borderRadius: 0,
      border: 0,
      fontWeight: 500,
      minHeight: 44,
      minWidth: 230,
      lineHeight: '21px',
      padding: '12px 20px',
    },
  },
  defaultProps: { disableRipple: true },
  variants: [
    {
      props: { variant: 'primary' },
      style: {
        backgroundColor: 'var(--mui-button-primary-background-color)',
        color: 'var(--mui-button-primary-text)',
        ':hover': {
          backgroundColor: 'var(--mui-button-primary-background-color-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--mui-button-primary-background-color-active)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--mui-button-primary-background-color-disabled)',
          color: 'var(--mui-button-primary-text-disabled)',
        },
      },
    },
    {
      props: { variant: 'secondary' },
      style: {
        backgroundColor: 'var(--mui-button-flat-background-color)',
        color: 'var(--mui-button-flat-text-color)',
        border: 0,
        ':hover': {
          backgroundColor: 'var(--mui-button-flat-background-color-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--mui-button-flat-background-color-active)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--mui-button-flat-background-color-disabled)',
          color: 'var(--mui-button-flat-text-color-disabled)',
        },
      },
    },
  ],
};

const ModernButton = {
  styleOverrides: {
    root: {
      fontSize: '1rem',
      borderRadius: 8,
      fontWeight: 500,
      minHeight: 52,
      minWidth: 230,
      lineHeight: '21px',
      textTransform: 'uppercase',
      padding: '16px',
    },
  },
  defaultProps: { disableRipple: true },
  variants: [
    {
      props: { variant: 'primary' },
      style: {
        backgroundColor: 'var(--mui-button-primary-background-color)',
        color: 'var(--mui-button-primary-text)',
        ':hover': {
          backgroundColor: 'var(--mui-button-primary-background-color-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--mui-button-primary-background-color-active)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--mui-button-primary-background-color-disabled)',
          color: 'var(--mui-button-primary-text-disabled)',
        },
      },
    },
    {
      props: { variant: 'secondary' },
      style: {
        backgroundColor: 'var(--mui-button-outlined-background-color)',
        color: 'var(--mui-button-outlined-text-color)',
        border: '2px solid',
        borderColor: 'var(--mui-button-outlined-border-color)',
        ':hover': {
          color: 'var(--mui-button-outlined-text-color)',
          borderColor: 'var(--mui-button-outlined-border-color-hover)',
          backgroundColor: 'var(--mui-button-outlined-background-color-active)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--mui-button-outlined-background-color-active)',
        },
        '&.Mui-disabled': {
          border: '2px solid',
          backgroundColor: 'var(--mui-button-outlined-background-color-disabled)',
          color: 'var(--mui-button-outlined-text-color-disabled)',
          borderColor: 'var(--mui-button-outlined-border-color-disabled)',
        },
      },
    },
  ],
};

export { ClassicButton, ModernButton };

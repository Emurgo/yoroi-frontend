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
      padding: '12px 20px',
      textTransform: 'none',
    },
  },
  defaultProps: { disableRipple: true },
  variants: [
    {
      props: { variant: 'primary' },
      style: {
        backgroundColor: 'var(--component-button-primary-background)',
        color: 'var(--component-button-primary-text)',
        ':hover': {
          backgroundColor: 'var(--component-button-primary-background-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--component-button-primary-background-active)',
        },
        '&.Mui-disabled': {
          opacity: 0.4,
          color: 'var(--component-button-primary-text)',
        },
        '& .MuiLoadingButton-loadingIndicator': {
          color: 'var(--component-button-primary-text)',
        },
      },
    },
    {
      props: { variant: 'secondary' },
      style: {
        backgroundColor: 'var(--component-button-flat-background)',
        color: 'var(--component-button-flat-text)',
        border: 0,
        ':hover': {
          backgroundColor: 'var(--component-button-flat-background-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--component-button-flat-background-active)',
        },
        '&.Mui-disabled': {
          color: 'var(--component-button-flat-text)',
          opacity: 0.4,
        },
        '& .MuiLoadingButton-loadingIndicator': {
          color: 'var(--component-button-flat-text)',
        },
      },
    },
    {
      props: { variant: 'danger' },
      style: {
        backgroundColor: 'var(--component-button-danger-background)',
        color: 'var(--component-button-danger-text)',
        border: 0,
        ':hover': {
          backgroundColor: 'var(--component-button-danger-background-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--component-button-danger-background-active)',
        },
        '&.Mui-disabled': {
          opacity: 0.4,
          color: 'var(--component-button-danger-text)',
        },
        '& .MuiLoadingButton-loadingIndicator': {
          color: 'var(--component-button-danger-background)',
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
      lineHeight: '18px',
      textTransform: 'uppercase',
      padding: '16px',
      height: 52,
    },
  },
  defaultProps: { disableRipple: true },
  variants: [
    {
      props: { variant: 'primary' },
      style: {
        backgroundColor: 'var(--component-button-primary-background)',
        color: 'var(--component-button-primary-text)',
        ':hover': {
          backgroundColor: 'var(--component-button-primary-background-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--component-button-primary-background-active)',
        },
        '&.Mui-disabled': {
          opacity: 0.4,
          color: 'var(--component-button-primary-text)',
        },
        '& .MuiLoadingButton-loadingIndicator': {
          color: 'var(--component-button-primary-text)',
        },
      },
    },
    {
      props: { variant: 'secondary' },
      style: {
        backgroundColor: 'var(--component-button-secondary-background)',
        color: 'var(--component-button-secondary-text)',
        border: '2px solid',
        borderColor: 'var(--component-button-secondary-border)',
        ':hover': {
          color: 'var(--component-button-secondary-text)',
          borderColor: 'var(--component-button-secondary-border-hover)',
          backgroundColor: 'var(--component-button-secondary-background-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--component-button-secondary-background-active)',
        },
        '&.Mui-disabled': {
          border: '2px solid',
          opacity: 0.4,
          borderColor: 'var(--component-button-secondary-border)',
          color: 'var(--component-button-secondary-text)',
        },
        '& .MuiLoadingButton-loadingIndicator': {
          color: 'var(--component-button-secondary-text)',
        },
      },
    },
    {
      props: { variant: 'danger' },
      style: {
        backgroundColor: 'var(--component-button-danger-background)',
        color: 'var(--component-button-danger-text)',
        border: 0,
        ':hover': {
          backgroundColor: 'var(--component-button-danger-background-hover)',
        },
        '&.Mui-active': {
          backgroundColor: 'var(--component-button-danger-background-active)',
        },
        '&.Mui-disabled': {
          color: 'var(--component-button-danger-text)',
          opacity: 0.4,
        },
        '& .MuiLoadingButton-loadingIndicator': {
          color: 'var(--component-button-danger-background)',
        },
      },
    },
  ],
};

export { ClassicButton, ModernButton };

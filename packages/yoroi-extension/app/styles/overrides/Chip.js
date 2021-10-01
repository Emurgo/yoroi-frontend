// @flow
const ClassicChip = {
  styleOverrides: {
    root: {
      minWidth: '87px',
      textAlign: 'center',
      fontSize: '0.75rem',
      lineHeight: '21px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      borderRadius: '8px',
      paddingTop: '3px',
      height: '25px',
      userSelect: 'none',
      border: 'none',
    },
  },
  variants: [
    {
      props: { variant: 'pending' },
      style: {
        background: 'var(--mui-transactions-state-pending-background-color)',
        color: 'var(--mui-transactions-state-pending-text-color)',
      },
    },
    {
      props: { variant: 'high' },
      style: {
        background: 'var(--mui-transactions-state-high-background-color)',
        color: 'var(--mui-transactions-state-high-text-color)',
      },
    },
    {
      props: { variant: 'failed' },
      style: {
        background: 'var(--mui-transactions-state-failed-background-color)',
        color: 'var(--mui-transactions-state-failed-text-color)',
      },
    },
    {
      props: { variant: 'medium' },
      style: {
        background: 'var(--mui-transactions-state-medium-background-color)',
        color: 'var(--mui-transactions-state-medium-text-color)',
      },
    },
    {
      props: { variant: 'low' },
      style: {
        background: 'var(--mui-transactions-state-low-background-color)',
        color: 'var(--mui-transactions-state-low-text-color)',
      },
    },
    {
      props: { variant: 'autocomplete' },
      style: {
        minWidth: 'auto',
        borderRadius: '2px',
        margin: '5px 3px 0 3px',
        textTransform: 'lowercase',
        padding: '3px 0 3px 6px',
        background: '#daa49a',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        color: '#f9fafb',
        fontSize: '0.9rem',
        fontWeight: 300,
        span: {
          padding: 0,
          marginLeft: '2px',
          paddingRight: '10px',
        },
        '& .MuiChip-deleteIcon': {
          color: 'inherit',
        },
        '&:hover': {
          background: '#daa49a',
        },
      },
    },
  ],
};

const ModernChip = {
  styleOverrides: {
    root: {
      minWidth: '87px',
      textAlign: 'center',
      fontSize: '0.75rem',
      lineHeight: '21px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      borderRadius: '8px',
      paddingTop: '3px',
      height: '25px',
      userSelect: 'none',
      border: 'none',
    },
  },
  variants: [
    {
      props: { variant: 'pending' },
      style: {
        background: 'var(--mui-transactions-state-pending-background-color)',
        color: 'var(--mui-transactions-state-pending-text-color)',
      },
    },
    {
      props: { variant: 'high' },
      style: {
        background: 'var(--mui-transactions-state-high-background-color)',
        color: 'var(--mui-transactions-state-high-text-color)',
      },
    },
    {
      props: { variant: 'failed' },
      style: {
        background: 'var(--mui-transactions-state-failed-background-color)',
        color: 'var(--mui-transactions-state-failed-text-color)',
      },
    },
    {
      props: { variant: 'medium' },
      style: {
        background: 'var(--mui-transactions-state-medium-background-color)',
        color: 'var(--mui-transactions-state-medium-text-color)',
      },
    },
    {
      props: { variant: 'low' },
      style: {
        background: 'var(--mui-transactions-state-low-background-color)',
        color: 'var(--mui-transactions-state-low-text-color)',
      },
    },
    {
      props: { variant: 'autocomplete' },
      style: {
        minWidth: 'auto',
        borderRadius: '8px',
        textTransform: 'lowercase',
        margin: '5px 3px 0 3px',
        padding: '3px 0 4px 3px',
        background: '#f0f3f5',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        fontWeight: 300,
        color: '#363636',
        letterSpacing: 0,
        span: {
          padding: 0,
          paddingRight: '9px',
          paddingLeft: '7px',
        },
        '& .MuiChip-deleteIcon': {
          color: 'inherit',
        },
        '&:hover': {
          background: '#f0f3f5',
        },
      },
    },
  ],
  defaultProps: {
    readOnly: true,
  },
};

export { ClassicChip, ModernChip };

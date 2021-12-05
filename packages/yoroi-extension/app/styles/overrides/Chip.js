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
        background: 'var(--yoroi-palette-tx-status-pending-background)',
        color: 'var(--yoroi-palette-tx-status-pending-text)',
      },
    },
    {
      props: { variant: 'high' },
      style: {
        background: 'var(--yoroi-palette-tx-status-high-background)',
        color: 'var(--yoroi-palette-tx-status-high-text)',
      },
    },
    {
      props: { variant: 'failed' },
      style: {
        background: 'var(--yoroi-palette-tx-status-failed-background)',
        color: 'var(--yoroi-palette-tx-status-failed-text)',
      },
    },
    {
      props: { variant: 'medium' },
      style: {
        background: 'var(--yoroi-palette-tx-status-medium-background)',
        color: 'var(--yoroi-palette-tx-status-medium-text)',
      },
    },
    {
      props: { variant: 'low' },
      style: {
        background: 'var(--yoroi-palette-tx-status-low-background)',
        color: 'var(--yoroi-palette-tx-status-low-text)',
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
        background: 'var(--yoroi-palette-tx-status-pending-background)',
        color: 'var(--yoroi-palette-tx-status-pending-text)',
      },
    },
    {
      props: { variant: 'high' },
      style: {
        background: 'var(--yoroi-palette-tx-status-high-background)',
        color: 'var(--yoroi-palette-tx-status-high-text)',
      },
    },
    {
      props: { variant: 'failed' },
      style: {
        background: 'var(--yoroi-palette-tx-status-failed-background)',
        color: 'var(--yoroi-palette-tx-status-failed-text)',
      },
    },
    {
      props: { variant: 'medium' },
      style: {
        background: 'var(--yoroi-palette-tx-status-medium-background)',
        color: 'var(--yoroi-palette-tx-status-medium-text)',
      },
    },
    {
      props: { variant: 'low' },
      style: {
        background: 'var(--yoroi-palette-tx-status-low-background)',
        color: 'var(--yoroi-palette-tx-status-low-text)',
      },
    },
    {
      props: { variant: 'autocomplete' },
      style: {
        minWidth: 'auto',
        borderRadius: '8px',
        textTransform: 'lowercase',
        margin: '5px 4px 0 4px',
        padding: '3px 0 4px 3px',
        background: 'var(--yoroi-palette-gray-50)',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        color: 'var(--yoroi-palette-gray-900)',
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
          background: 'var(--yoroi-palette-gray-50)',
        },
      },
    },
  ],
  defaultProps: {
    readOnly: true,
  },
};

export { ClassicChip, ModernChip };

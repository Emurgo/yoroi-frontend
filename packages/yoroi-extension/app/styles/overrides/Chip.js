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
  ],
};

const ModernChip = { ...ClassicChip };

export { ClassicChip, ModernChip };

// @flow

const ClassicTabs = {
  styleOverrides: {
    root: {
      borderBottom: 'none',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      boxShadow:
        '0 4px 6px 0 hsl(220deg 22% 89%), 0 1px 2px 0 hsl(220deg 22% 89% / 82%), 0 2px 4px 0 hsl(220deg 22% 89% / 74%)',
      '& .MuiTab-root': {
        background: 'var(--component-tabs-background)',
        color: 'var(--component-tabs-text)',
        fontSize: '1rem',
        paddingRight: 24,
        paddingLeft: 24,
        textTransform: 'capitalize',
        ':hover': {
          color: 'var(--component-tabs-text-active)',
        },
      },
      '& .Mui-selected ': {
        fontWeight: 500,
        color: 'var(--component-tabs-text-active)',
      },
      '& .Mui-disabled': {
        color: 'var(--component-tabs-text-disabled)',
      },
    },
  },
  defaultProps: {
    indicatorColor: 'secondary',
    textColor: 'secondary',
  },
};

const ModernTabs = {
  styleOverrides: {
    root: {
      borderBottom: 'none',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      boxShadow:
        '0 4px 6px 0 hsl(220deg 22% 89%), 0 1px 2px 0 hsl(220deg 22% 89% / 82%), 0 2px 4px 0 hsl(220deg 22% 89% / 74%)',
      '& .MuiTab-root': {
        background: 'var(--component-tabs-background)',
        color: 'var(--component-tabs-text)',
        fontSize: '1rem',
        paddingRight: 24,
        paddingLeft: 24,
        textTransform: 'capitalize',
        ':hover': {
          color: 'var(--component-tabs-text-active)',
        },
      },
      '& .Mui-selected ': {
        fontWeight: 500,
        color: 'var(--component-tabs-text-active)',
      },
      '& .Mui-disabled': {
        color: 'var(--component-tabs-text-disabled)',
      },
    },
  },
  defaultProps: {
    indicatorColor: 'secondary',
    textColor: 'secondary',
  },
};
export { ClassicTabs, ModernTabs };

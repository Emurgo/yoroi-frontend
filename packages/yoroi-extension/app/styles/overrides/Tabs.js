// @flow

const Tabs = {
  styleOverrides: {
    // $FlowFixMe
    root: ({ theme }) => ({
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      boxShadow: '0 4px 6px 0 hsl(220deg 22% 89%), 0 1px 2px 0 hsl(220deg 22% 89% / 82%), 0 2px 4px 0 hsl(220deg 22% 89% / 74%)',
      '& .MuiTab-root': {
        color: theme.palette.ds.gray_600,
        fontSize: '1rem',
        lineHeight: '22px',
        padding: '6px 24px',
        textTransform: 'capitalize',
        minHeight: 'unset',
        ':hover': { color: theme.palette.ds.primary_600 },
      },
      '& .Mui-selected': { fontWeight: 500, color: theme.palette.ds.primary_600 },
      '& .Mui-disabled': { color: theme.palette.ds.gray_400 },
      '& .MuiTabs-indicator': {
        backgroundColor: theme.palette.ds.primary_600,
        height: '3px',
      },
      '& .MuiTabs-flexContainer': {
        height: 'fit-content',
      },
      '& .MuiTabs-scroller': {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
      },
    }),
  },
  defaultProps: {
    textColor: 'ds.primary_500',
  },
};
export { Tabs };

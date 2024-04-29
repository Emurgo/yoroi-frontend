// @flow

const Tabs = {
  styleOverrides: {
    // $FlowFixMe
    root: ({ theme }) => ({
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      boxShadow:
        '0 4px 6px 0 hsl(220deg 22% 89%), 0 1px 2px 0 hsl(220deg 22% 89% / 82%), 0 2px 4px 0 hsl(220deg 22% 89% / 74%)',
      '& .MuiTab-root': {
        color: theme.palette.grayscale[600],
        fontSize: '1rem',
        lineHeight: '22px',
        padding: '6px 24px',
        textTransform: 'capitalize',
        minHeight: 'unset',
        ':hover': { color: theme.palette.primary[600] },
      },
      '& .Mui-selected': { fontWeight: 500, color: theme.palette.primary[600] },
      '& .Mui-disabled': { color: theme.palette.grayscale[400] },
      '& .MuiTabs-indicator': {
        backgroundColor: theme.palette.primary[600],
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
    textColor: 'primary.main',
  },
};
export { Tabs };

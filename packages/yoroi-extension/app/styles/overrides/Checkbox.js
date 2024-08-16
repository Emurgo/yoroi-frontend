// @flow

const Checkbox: any = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: 0,
      marginRight: '18px',
      borderRadius: '2px',
      color: theme.palette.ds.gray_800,
      '&.Mui-checked': { color: theme.palette.ds.primary_500 },
      '&.Mui-disabled': {
        color: theme.palette.ds.gray_400,
        backgroundColor: theme.palette.ds.gray_400,
      },
    }),
  },
};

export { Checkbox };

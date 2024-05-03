// @flow

const Checkbox: any = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: 0,
      marginRight: '18px',
      borderRadius: '2px',
      color: theme.palette.ds.gray_c800,
      '&.Mui-checked': { color: theme.palette.ds.primary_c500 },
      '&.Mui-disabled': {
        color: theme.palette.ds.gray_c400,
        backgroundColor: theme.palette.ds.gray_c400,
      },
    }),
  },
};

export { Checkbox };

// @flow

const Checkbox: any = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: 0,
      marginRight: '18px',
      borderRadius: '2px',
      color: theme.palette.grayscale[800],
      '&.Mui-checked': { color: theme.palette.primary[500] },
      '&.Mui-disabled': {
        color: theme.palette.grayscale[400],
        backgroundColor: theme.palette.grayscale[400],
      },
    }),
  },
};

export { Checkbox };

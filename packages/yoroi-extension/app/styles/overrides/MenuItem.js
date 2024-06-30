// @flow

const MenuItem = {
  styleOverrides: {
    root: {
      padding: '14px 20px',
      bgcolor: 'ds.gray_cmin',
      height: 45,
      color: 'ds.gray_c900',
      '&:hover': { background: 'ds.gray_c50' },
      '&.Mui-selected': {
        background: 'ds.gray_c50',
        position: 'relative',
        '&:hover': { backgroundColor: 'ds.gray_c50' },
        '&::after': {
          content: '""',
          position: 'absolute',
          borderColor: 'ds.secondary_c300',
          borderStyle: 'solid',
          borderWidth: '0 2px 2px 0',
          height: '9px',
          margin: '0 2px 3px auto',
          transform: 'rotate(45deg)',
          width: '5px',
          right: '22px',
        },
      },
    },
  },
};
export { MenuItem };

// @flow

const MenuItem = {
  styleOverrides: {
    root: {
      padding: '14px 20px',
      bgcolor: 'static.white',
      height: 45,
      color: 'grayscale.900',
      '&:hover': { background: 'grayscale.50' },
      '&.Mui-selected': {
        background: 'grayscale.50',
        position: 'relative',
        '&:hover': { backgroundColor: 'grayscale.50' },
        '&::after': {
          content: '""',
          position: 'absolute',
          borderColor: 'secondary.300',
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

import { Button, Typography } from '@mui/material';

interface Props {
  label: string;
  onClick: () => void;
  variant: any;
  sx?: any;
  width?: string;
  pathId?: string;
}

const NavigationButton = ({ label, onClick, variant, sx, width, pathId='', ...props }: Props) => {
  const cleanLabelName = label
    .split(' ')
    .map((word, index) => (index === 0 ? word.toLowerCase() : word[0]?.toUpperCase() + word.slice(1)))
    .join('');

  const fullPathId = `${pathId}-${cleanLabelName}-button`;
  return (
    <Button
      onClick={onClick}
      variant={variant}
      {...props}
      sx={(theme: any) => ({
        maxHeight: '40px',
        width: width || '140.25px',
        padding: '9px 20px !important',

        '&.MuiButton-contained': {
          backgroundColor: theme.palette.ds.el_primary_medium,
          color: theme.palette.ds.white_static,

          '&:hover': {
            backgroundColor: theme.palette.ds.el_primary_max,
          },
        },

        '&.MuiButton-secondary': {
          color: theme.palette.ds.text_primary_medium,
        },
        ...sx,
      })}
      id={fullPathId}
    >
      {/* @ts-ignore */}
      <Typography variant="button2">{label}</Typography>
    </Button>
  );
};

export default NavigationButton;

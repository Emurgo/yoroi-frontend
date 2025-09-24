import { Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactComponent as BackIcon } from '../../assets/images/assets-page/back-arrow.inline.svg';

const SButton = styled(Button)(({ theme }: any) => ({
  color: theme.palette.ds.el_gray_medium,
  '&.MuiButton-sizeMedium': {
    padding: '13px 16px',
  },
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

export const BackButton = ({ label, onAction, pathId=''}: { label: string; onAction: () => void; pathId?: string }) => {
  return (
    <SButton onClick={onAction} startIcon={<BackIcon />} id={`${pathId}-back-button`}>
      <Typography fontWeight="500" fontSize="14px">
        {label}
      </Typography>
    </SButton>
  );
};

import { IconButton, styled, Box, Typography } from '@mui/material';
import React from 'react';
import { useStrings } from '../../common/hooks/useStrings';
import { Icon } from '../icons/index';

enum NotificationTypes {
  Income = "Income",
  Cancelled = "Cancelled",
  Outcome = "Outcome",
  Rewards = "Rewards"
}

interface Props {
  text: string;
  type: NotificationTypes;
  onClick(): void;
  onClose(): void;
}

const IconWrapper = styled(IconButton)(({ theme }: any) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

const SNotificationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderRadius: '8px',
  width: '446px',
  paddingTop: '16px',
  paddingBottom: '16px',
  backgroundColor: theme.palette["ds"].bg_color_contrast_high,
  boxShadow: theme.palette["ds"].light_shadow_notification,
}));

export default function NotificationToast({ onClick, onClose, text, type }: Props) {
  const strings = useStrings();

  const handleClick = (e) => {
    e.preventDefault();
    console.log("clicked");
    onClick();
  }

  const handleClose = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
    console.log("closed");
  }

  return (
    <Box id="notif-toast" sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
      <SNotificationContainer onClick={handleClick}>
        <Box px="16px" flexShrink={0} sx={{ cursor: 'pointer', alignSelf: 'center' }}>
          <Box borderRadius="50%" bgcolor="ds.secondary_100" width="40px" height="40px" display="flex" alignItems="center" justifyContent="center">
            {type === NotificationTypes.Rewards ? <Icon.Staking fill='#08C29D' /> : <Icon.ChipArrowDown fill='#08C29D' />}
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, cursor: "pointer" }}>
          <Typography mb="2px" component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">{text}</Typography>
          <Typography component="div" variant='body2' color="ds.text_gray_low">{strings.clickToView}</Typography>
        </Box>
        <Box px="12px" flexShrink={0}>
          <IconWrapper onClick={handleClose} sx={{ padding: 0 }}>
            <Icon.CloseIcon fill='#6B7384' />
          </IconWrapper>
        </Box>
      </SNotificationContainer>
    </Box>
  );
};

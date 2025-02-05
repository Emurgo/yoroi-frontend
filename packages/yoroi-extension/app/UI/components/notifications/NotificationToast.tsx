import { IconButton, styled, Box, Typography, useTheme } from '@mui/material';
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

type IconProps = {
  type: NotificationTypes
}


const IconContainer = ({ children, ...props }) => (
  <Box {...props} sx={{
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }} >
    {children}
  </Box>
)

const NotificationIcon = ({ type }: IconProps) => {
  const theme = useTheme();

  console.log("theme", theme.palette["ds"], theme.palette)

  switch (type) {
    case NotificationTypes.Rewards:
      return (
        <IconContainer bgcolor="ds.secondary_100">
          <Icon.Staking fill={theme.palette["ds"].static_green} />
        </IconContainer>
      )
    case NotificationTypes.Income:
      return (
        <IconContainer bgcolor="ds.secondary_100">
          <Icon.Receive fill={theme.palette["ds"].static_green} />
        </IconContainer>
      )
    case NotificationTypes.Outcome:
      return (
        <IconContainer bgcolor="ds.primary_100">
          <Icon.Send fill={theme.palette["ds"].primary_600} />
        </IconContainer>
      )
    case NotificationTypes.Cancelled:
      return (
        <IconContainer bgcolor="ds.sys_magenta_100">
          <Icon.Cancel fill={theme.palette["ds"].sys_magenta_500} />
        </IconContainer>
      )
    default:
      return null;
  }
}

export default function NotificationToast({ onClick, onClose, text, type }: Props) {
  const strings = useStrings();
  const theme = useTheme();

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
          <NotificationIcon type={type} />
        </Box>
        <Box sx={{ flexGrow: 1, cursor: "pointer" }}>
          <Typography mb="2px" component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">{text}</Typography>
          <Typography component="div" variant='body2' color="ds.text_gray_low">{strings.clickToView}</Typography>
        </Box>
        <Box px="12px" flexShrink={0}>
          <IconWrapper onClick={handleClose} sx={{ padding: 0 }}>
            <Icon.CloseIcon fill={theme.palette["ds"].el_gray_low} />
          </IconWrapper>
        </Box>
      </SNotificationContainer>
    </Box>
  );
};

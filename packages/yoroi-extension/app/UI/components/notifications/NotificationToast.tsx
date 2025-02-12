import React from 'react';
import { IconButton, styled, Box, useTheme, Typography } from '@mui/material';
import { Icon } from '../icons/index';
import { NotificationTypes } from '../../types/notifications';
import { FadeInOut } from './NotificationsStyles';
import { toast } from 'react-toastify';

const NOTIFICATION_TIMEOUT = 3000; // 3s

export type NotificationProps = {
  title: string;
  subtitle: string;
  type: NotificationTypes;
}
type IconProps = {
  type: NotificationTypes
}

const IconWrapper = styled(IconButton)(({ theme }: any) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

export const NotificationCloseButton = ({ closeToast }) => {
  const theme = useTheme()
  const handleClose = () => {
    closeToast("closed");
  }

  return (
    <IconWrapper onClick={handleClose} sx={{ padding: 0 }}>
      <Icon.CloseIcon fill={theme.palette["ds"].el_gray_low} />
    </IconWrapper>
  )
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

const NotificationBody = ({ title, subtitle }) => {
  return (
    <Box sx={{ flexGrow: 1, cursor: "pointer" }}>
      <Typography mb="2px" component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">{title}</Typography>
      <Typography component="div" variant='body2' color="ds.text_gray_low">{subtitle}</Typography>
    </Box>
  )
}

export function createToast({ title, subtitle, type }: NotificationProps) {
  return toast(<NotificationBody title={title} subtitle={subtitle} />, {
    autoClose: NOTIFICATION_TIMEOUT,
    icon: () => <NotificationIcon type={type} />,
    transition: FadeInOut,
    closeOnClick: true,
  });
}
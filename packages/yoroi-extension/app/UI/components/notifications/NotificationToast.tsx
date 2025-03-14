import { Box, Typography, useTheme } from '@mui/material';
import { noop } from 'lodash';
import React from 'react';
import { Theme, toast } from 'react-toastify';
import { NotificationTypes } from '../../types/notifications';
import { Icon } from '../icons/index';

const NOTIFICATION_TIMEOUT = 4000; // 4s

export type NotificationProps = {
  title: string;
  subtitle: string;
  type: NotificationTypes;
  theme: Theme;
  id: string;
  onClick(props: any): void;
  onClose(props: any): void;
};
type IconProps = {
  type: NotificationTypes;
};

export const NotificationCloseButton = ({ closeToast, ...props }) => {
  const theme = useTheme();

  const handleClose = e => {
    e.stopPropagation();
    const { onClose } = props.data;
    onClose && onClose(props);
  };

  return (
    <Box
      onClick={handleClose}
      sx={{
        padding: 0,
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <Icon.CloseIcon fill={theme.palette['ds'].el_gray_medium} />
    </Box>
  );
};

const IconContainer = ({ children, ...props }) => (
  <Box
    {...props}
    sx={{
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </Box>
);

const NotificationIcon = ({ type }: IconProps) => {
  const theme = useTheme();
  switch (type) {
    case NotificationTypes.Rewards:
      return (
        <IconContainer bgcolor="ds.secondary_100">
          <Icon.Staking fill={theme.palette['ds'].static_green} />
        </IconContainer>
      );
    case NotificationTypes.Income:
      return (
        <IconContainer bgcolor="ds.secondary_100">
          <Icon.Receive fill={theme.palette['ds'].static_green} />
        </IconContainer>
      );
    case NotificationTypes.Outcome:
      return (
        <IconContainer bgcolor="ds.primary_100">
          <Icon.Send fill={theme.palette['ds'].primary_600} />
        </IconContainer>
      );
    case NotificationTypes.Cancelled:
      return (
        <IconContainer bgcolor="ds.sys_magenta_100">
          <Icon.Cancel fill={theme.palette['ds'].sys_magenta_500} />
        </IconContainer>
      );
    default:
      return null;
  }
};

const NotificationBody = ({ toastProps }: any) => {
  const { data } = toastProps;
  const { title, subtitle, onClick } = data;

  const handleClick = () => {
    onClick && onClick(toastProps);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }} onClick={handleClick}>
      <Box sx={{ width: '324px', cursor: 'pointer' }}>
        <Typography mb="2px" component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">
          {title}
        </Typography>
        <Typography component="div" variant="body2" color="ds.text_gray_low">
          {subtitle}
        </Typography>
      </Box>
      <Box>
        <NotificationCloseButton {...toastProps} />
      </Box>
    </Box>
  );
};

export function createToast({ title, subtitle, type, id, onClick = noop, onClose = noop, theme = 'light' }: NotificationProps) {
  return toast(props => <NotificationBody {...props} />, {
    theme,
    toastId: id,
    autoClose: NOTIFICATION_TIMEOUT,
    icon: () => <NotificationIcon type={type} />,
    data: { title, subtitle, type, onClick, onClose },
    draggable: false,
  });
}

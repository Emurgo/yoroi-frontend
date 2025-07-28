// @flow
import { Box, Typography, IconButton, styled } from '@mui/material';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { Component } from 'react';
import { Icon } from '../../UI/components';
import { useNotifications } from '../../UI/features/notifications/module/NotificationsProvider';

type Props = {|
  +children?: ?Node,
  +title: ?Node,
  +walletDetails?: ?Node,
  +goToNotifications?: ?Function,
  +buyButton?: Node,
  +menu?: ?Node,
  +pageBanner?: ?Node,
  +isErrorPage?: boolean,
|};

const StyledButton = styled(IconButton)(({ theme }: any) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

function NavBarRevamp(props: Props) {
  const { title, children, walletDetails, menu, buyButton, pageBanner, isErrorPage } = props;
  const { setNotificationCenterOpen } = useNotifications();
  
  return (
    <Box
      sx={{
        backgroundColor: 'ds.bg_color_max',
        borderBottom: pageBanner || isErrorPage ? 'none' : '1px solid',
        borderBottomColor: 'grayscale.200',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 100, margin: 'auto' }}>
        <Box
          as="header"
          sx={{
            color: 'ds.el_gray_medium',
            display: 'flex',
            alignItems: 'center',
            height: 'inherit',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              margin: '20px 24px',
              marginBottom: menu != null ? '52px' : '',
            }}
          >
            <Box flex="0 0 auto">
              <Typography component="div" color="ds.el_gray_medium">{title}</Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {children}
              <StyledButton onClick={() => { setNotificationCenterOpen(true); }}>
                <Icon.Bell />
              </StyledButton>
              {buyButton && <Box sx={{ marginLeft: '25px' }}>{buyButton}</Box>}
              {walletDetails != null && (
                <Box sx={{ flex: '0 0 auto', marginLeft: '24px', minWidth: '280px' }}>{walletDetails}</Box>
              )}
            </Box>
          </Box>
          {menu != null && !isErrorPage ? <Box sx={{ position: 'absolute', bottom: 0, left: 0 }}>{menu}</Box> : null}
        </Box>
      </Box>
    </Box>
  );
}
export default observer(NavBarRevamp);

// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import NoticeBoardIcon from '../../assets/images/top-bar/notification.inline.svg';
import { Box, IconButton } from '@mui/material';

type Props = {|
  +children?: ?Node,
  +title: ?Node,
  +walletDetails?: ?Node,
  +goToNotifications?: ?Function,
  +buyButton?: Node,
  +menu?: ?Node,
|};

@observer
class NavBarRevamp extends Component<Props> {
  static defaultProps: {|
    children: void,
    walletDetails: void,
    goToNotifications: void,
    buyButton: void,
    menu: void,
  |} = {
    children: undefined,
    goToNotifications: undefined,
    walletDetails: undefined,
    buyButton: undefined,
    menu: undefined,
  };

  render(): Node {
    const { title, children, walletDetails, menu } = this.props;
    return (
      <Box
        sx={{
          backgroundColor: 'var(--yoroi-palette-common-white)',
          boxShadow:
            '0 4px 6px 0 #dee2ea, 0 1px 2px 0 rgba(222, 226, 234, 0.82), 0 2px 4px 0 rgba(222, 226, 234, 0.74)',
        }}
      >
        <Box
          sx={{
            maxWidth: 'calc(1366px - 90px)',
            position: 'relative',
            zIndex: 100,
            height: menu != null ? '115px' : '90px',
            margin: 'auto',
          }}
        >
          <Box
            as="header"
            sx={{
              color: 'var(--yoroi-palette-gray-800)',
              display: 'flex',
              alignItems: 'center',
              height: 'inherit',
              padding: menu != null ? '34px 40px 50px' : '32px 40px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Box flex="0 0 auto">{title}</Box>
              <Box
                sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
              >
                {children}
                {this.props.buyButton != null && (
                  <Box sx={{ marginLeft: '24px' }}>{this.props.buyButton}</Box>
                )}
                {this.props.walletDetails != null && (
                  <Box sx={{ flex: '0 0 auto', marginLeft: '32px', minWidth: '280px' }}>
                    {walletDetails}
                  </Box>
                )}
              </Box>
            </Box>
            {menu != null ? (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                }}
              >
                {menu}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    );
  }
}
export default NavBarRevamp;

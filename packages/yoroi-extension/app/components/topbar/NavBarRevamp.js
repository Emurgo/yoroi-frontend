// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/material';
import { revampTheme } from '../../styles/themes/revamp-theme';

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
    const { title, children, walletDetails, menu, buyButton } = this.props;
    return (
      <Box
        sx={{
          backgroundColor: 'common.white',
          // todo: box shadow should be removed
          boxShadow:
            '0 4px 6px 0 #dee2ea, 0 1px 2px 0 rgba(222, 226, 234, 0.82), 0 2px 4px 0 rgba(222, 226, 234, 0.74)',
        }}
      >
        <Box
          sx={{
            paddingX: '16px',
            [revampTheme.breakpoints.up('lg')]: {
              paddingX: '24px',
            },
          }}
        >
          <Box
            as="header"
            sx={{
              color: 'gray.800',
              display: 'flex',
              alignItems: 'center',
              height: 'inherit',
              py: '20px',
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
                {buyButton && <Box sx={{ marginLeft: '24px' }}>{buyButton}</Box>}
                {walletDetails != null && (
                  <Box sx={{ flex: '0 0 auto', marginLeft: '32px', minWidth: '280px' }}>
                    {walletDetails}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          <Box>{menu}</Box>
        </Box>
      </Box>
    );
  }
}
export default NavBarRevamp;

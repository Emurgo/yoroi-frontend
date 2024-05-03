// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/material';

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
          backgroundColor: 'ds.gray_cmin',
          borderBottom: '1px solid',
          borderBottomColor: 'ds.gray_c200',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 100, margin: 'auto' }}>
          <Box
            as="header"
            sx={{
              color: 'ds.gray_c800',
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
              <Box flex="0 0 auto">{title}</Box>
              <Box
                sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
              >
                {children}
                {buyButton && <Box sx={{ marginLeft: '25px' }}>{buyButton}</Box>}
                {walletDetails != null && (
                  <Box sx={{ flex: '0 0 auto', marginLeft: '24px', minWidth: '280px' }}>
                    {walletDetails}
                  </Box>
                )}
              </Box>
            </Box>
            {menu != null ? (
              <Box sx={{ position: 'absolute', bottom: 0, left: 0 }}>{menu}</Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    );
  }
}
export default NavBarRevamp;

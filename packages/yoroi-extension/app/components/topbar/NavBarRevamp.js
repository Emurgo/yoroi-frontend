// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './NavBarRevamp.scss';
import { withLayout } from '../../styles/context/layout';
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
type InjectProps = {| isRevampLayout: boolean |};

@observer
class NavBarRevamp extends Component<Props & InjectProps> {
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
      <header
        className={classnames([styles.navbarRevamp, menu != null && styles.navbarRevampWithMenu])}
      >
        <div className={styles.mainRevamp}>
          <div className={styles.title}>{title}</div>
          <div className={styles.content}>
            {children}
            {this.props.walletDetails != null && (
              <Box sx={{ flex: '0 0 auto', marginLeft: '32px', minWidth: '280px' }}>
                {walletDetails}
              </Box>
            )}
            <IconButton
              sx={{ color: 'var(--yoroi-palette-gray-600)', marginLeft: '11.5px' }}
              type="button"
              onClick={this.props.goToNotifications}
            >
              <NoticeBoardIcon />
            </IconButton>
            {this.props.buyButton != null && (
              <Box sx={{ marginLeft: '24px' }}>{this.props.buyButton}</Box>
            )}
          </div>
        </div>
        {menu != null ? <div className={styles.menu}>{menu}</div> : null}
      </header>
    );
  }
}
export default (withLayout(NavBarRevamp): ComponentType<Props>);

// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import InfoIcon from '../../assets/images/info_icon.inline.svg';
import styles from './Sidebar.scss';
import { ROUTES } from '../../routes-config';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';

type Props = {| onClickNavItems: () => void |};

@observer
export default class Sidebar extends Component<Props> {
  render(): Node {
    const navItems = [
      {
        label: 'About',
        icon: <InfoIcon />,
        route: ROUTES.ROOT,
      },
      {
        label: 'Connected Websites',
        icon: <InfoIcon />,
        route: ROUTES.CONNECTED_WEBSITES,
      },
      {
        label: 'Support',
        icon: <InfoIcon />,
        route: ROUTES.ROOT,
      },
      {
        label: 'Term of Services',
        icon: <InfoIcon />,
        route: ROUTES.ROOT,
      },
    ];
    const { onClickNavItems } = this.props;
    return (
      <ul className={styles.list}>
        {navItems.map(({ label, icon, route }) => (
          <li className={styles.listItem}>
            <Link to={route} onClick={onClickNavItems}>
              {icon}
              <span className={styles.label}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}

// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './Navbar.scss'
import type { Node } from 'react';
import { ROUTES } from '../../../routes-config';
import classNames from 'classnames';

type Props = {|
    goToRoute: string => void,
|}

const PAGES = [
  {
    label: 'Yoroi Palette',
    route: ROUTES.EXPERIMENTAL.YOROI_PALETTE
  },
  {
    label: 'Themes',
    route: ROUTES.EXPERIMENTAL.THEMES
  }
]
@observer
export default class Navbar extends Component<Props> {

    render(): Node {
        return (
          <div className={styles.component}>
            {
              PAGES.map(page => (
                <button
                  onClick={() => this.props.goToRoute(page.route)}
                  className={classNames(
                    [styles.tab, window.location.href.endsWith(page.route) && styles.active]
                  )}
                  key={page.label}
                  type='button'
                >{page.label}
                </button>
              ))
            }
          </div>
        )
    }
}
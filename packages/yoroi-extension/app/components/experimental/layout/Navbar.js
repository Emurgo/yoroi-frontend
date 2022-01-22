// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './Navbar.scss'
import type { Node } from 'react';
import { ROUTES } from '../../../routes-config';
import classNames from 'classnames';

type Props = {|
    header: string,
    goToRoute: string,
|}

const PAGES = [
  {
    label: 'Yoroi Palette',
    route: ROUTES.EXPERIMENTAL.YOROI_PALETTE
  },
  {
    label: 'Yoroi Components',
    route: ROUTES.EXPERIMENTAL.YOROI_COMPONENTS
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
                  onClick={() => this.props.goToRoute({ route: page.route })}
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
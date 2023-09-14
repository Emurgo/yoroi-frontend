// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import styles from './SubMenu.scss';
import { withLayout } from '../../styles/context/layout';
import SubMenuItem from './SubMenuItem';

type Props = {|
  +isActiveItem: string => boolean,
  +onItemClick: string => void,
  +options: Array<{|
    +label: string,
    route: string,
    className: string,
  |}>,
|};
type InjectedProps = {|
  +isRevampLayout: boolean,
|};
type AllProps = {| ...Props, ...InjectedProps |};
@observer
class SubMenu extends Component<AllProps> {
  render(): Node {
    const { onItemClick, isActiveItem, options } = this.props;

    return (
      <div className={styles.componentWrapper} id="subMenu">
        <div className={this.props.isRevampLayout ? styles.componentRevamp : styles.component} id="settingsMenuLayout">
          {options.filter(Boolean).map(({ label, route, className }) => (
            <SubMenuItem
              key={label}
              label={label}
              onClick={() => onItemClick(route)}
              active={isActiveItem(route)}
              className={className}
            />
          ))}
        </div>
      </div>
    );
  }
}
export default (withLayout(SubMenu): ComponentType<Props>);

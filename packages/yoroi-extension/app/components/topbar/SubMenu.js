// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import styles from './SubMenu.scss';
import { withLayout } from '../../styles/context/layout';
import SubMenuItem from './SubMenuItem';

export type SubMenuOption = {|
  +label: string,
  route: string,
  className: string,
  hidden?: boolean,
|};

type Props = {|
  +isActiveItem: string => boolean,
  +onItemClick: string => void,
  +options: Array<SubMenuOption>,
  locationId: string,
|};
type InjectedProps = {|
  +isRevampLayout: boolean,
|};
type AllProps = {| ...Props, ...InjectedProps |};
@observer
class SubMenu extends Component<AllProps> {
  render(): Node {
    const { onItemClick, isActiveItem, options, locationId } = this.props;

    const isRevamp = this.props.isRevampLayout;
    return (
      <div className={styles.componentWrapper}>
        <div className={isRevamp ? styles.componentRevamp : styles.component}>
          {options
            .filter(o => !o.hidden)
            .map(({ label, route, className }) => (
              <SubMenuItem
                key={label}
                label={label}
                onClick={() => onItemClick(route)}
                active={isActiveItem(route)}
                className={className}
                locationId={locationId}
              />
            ))}
        </div>
      </div>
    );
  }
}
export default (withLayout(SubMenu): ComponentType<Props>);

// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './SubMenu.scss';
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

@observer
export default class SubMenu extends Component<Props> {
  render(): Node {
    const { onItemClick, isActiveItem, options, locationId } = this.props;

    return (
      <div className={styles.componentWrapper}>
        <div className={styles.componentRevamp}>
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

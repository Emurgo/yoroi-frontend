// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './OneSideBarDecoration.scss';

type Props = {|
  +children?: Node,
|};

@observer
export default class OneSideBarDecoration extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    const { children } = this.props;
    return (
      <div className={styles.separator}>{children}</div>
    );
  }
}

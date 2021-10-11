// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import classnames from 'classnames';
import styles from './NavDropdownRowRevamp.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +title?: string,
  +plateComponent?: ?Node,
  +detailComponent: ?Node,
  /**
   * null -> never synced
   * undefined -> don't display sync info
   */
  +syncTime?: void | null | string,
  +isCurrentWallet?: boolean,
  +onSelect?: void => void,
|};

@observer
export default class NavDropdownRowRevamp extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|
    isCurrentWallet: boolean,
    onSelect: void,
    plateComponent: void,
    syncTime: void,
    title: void,
  |} = {
    title: undefined,
    plateComponent: undefined,
    syncTime: undefined,
    onSelect: undefined,
    isCurrentWallet: false,
  };

  render(): Node {
    const { title, plateComponent, isCurrentWallet } = this.props;

    const wrapperClassname = classnames(
      styles.wrapper,
      isCurrentWallet !== null && isCurrentWallet === true && styles.currentWrapper,
      plateComponent === undefined && title !== undefined && styles.titleWrapper
    );

    const titleSection = this.getHead();
    return <div className={wrapperClassname}>{titleSection}</div>;
  }

  getHead: void => Node = () => {
    if (this.props.plateComponent != null && this.props.onSelect != null) {
      if (this.props.isCurrentWallet !== true) {
        return (
          <button className={styles.head} type="button" onClick={this.props.onSelect}>
            {this.props.plateComponent}
          </button>
        );
      }
      return <div className={styles.head}>{this.props.plateComponent}</div>;
    }
    return (
      <div className={styles.head}>
        <p className={styles.title}>{this.props.title}</p>
      </div>
    );
  };
}

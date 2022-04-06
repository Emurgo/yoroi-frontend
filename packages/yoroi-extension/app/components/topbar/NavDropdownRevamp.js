// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import type { Node, ElementRef } from 'react';
import { observer } from 'mobx-react';
import styles from './NavDropdownRevamp.scss';
import ArrowDown from '../../assets/images/my-wallets/arrow_down.inline.svg';

import NavDropdownContentRevamp from './NavDropdownContentRevamp';

type Props = {|
  +headerComponent?: ?Node,
  +contentComponents?: ?Node,
  +walletsCount?: number,
  +openWalletInfoDialog: void => void,
|};

type State = {|
  isExpanded: boolean,
|};

@observer
export default class NavDropdownRevamp extends Component<Props, State> {
  static defaultProps: {| contentComponents: void, headerComponent: void, walletsCount: void |} = {
    headerComponent: undefined,
    contentComponents: undefined,
    walletsCount: undefined,
  };

  state: State = {
    isExpanded: false,
  };

  buttonRef: ?ElementRef<*>;

  constructor(props: Props) {
    super(props);
    this.buttonRef = React.createRef();
  }

  toggleExpansion: void => void = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  };

  render(): Node {
    const { headerComponent, contentComponents, walletsCount, openWalletInfoDialog } = this.props;
    const { isExpanded } = this.state;

    return (
      <div
        className={styles.wrapper}
        onMouseEnter={this.toggleExpansion}
        onMouseLeave={this.toggleExpansion}
      >
        <div className={styles.component}>{headerComponent}</div>
        {isExpanded ? (
          <NavDropdownContentRevamp
            contentComponents={contentComponents}
            walletsCount={walletsCount}
            openWalletInfoDialog={openWalletInfoDialog}
          />
        ) : null}
      </div>
    );
  }
}

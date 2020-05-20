// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import type { Node, ElementRef } from 'react';
import { observer } from 'mobx-react';
import styles from './NavDropdown.scss';
import CaretIcon from '../../assets/images/wallet-nav/caret-down.inline.svg';
import NavDropdownContent from './NavDropdownContent';

type Props = {|
  +headerComponent?: ?Node,
  +contentComponents?: ?Node,
  +onAddWallet: void => void,
|};

type State = {|
  isExpanded: boolean
|};

@observer
export default class NavDropdown extends Component<Props, State> {
  static defaultProps: {|contentComponents: void, headerComponent: void|} = {
    headerComponent: undefined,
    contentComponents: undefined,
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
  }

  render(): Node {
    const {
      headerComponent,
      contentComponents,
    } = this.props;

    const { isExpanded } = this.state;

    return (
      <div className={styles.wrapper}>
        <div className={styles.head}>
          <div className={styles.component}>
            {headerComponent}
          </div>
          <button
            className={classnames([
              styles.toggle,
              isExpanded && styles.toggleRotate
            ])}
            type="button"
            ref={this.buttonRef}
            onClick={this.toggleExpansion}
          >
            <CaretIcon />
          </button>
        </div>
        {isExpanded === true && (
          <NavDropdownContent
            contentComponents={contentComponents}
            onAddWallet={this.props.onAddWallet}
            onClickOutside={this.toggleExpansion}
            buttonRef={this.buttonRef}
          />
        )}
      </div>
    );
  }
}

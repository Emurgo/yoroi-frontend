// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './NavDropdown.scss';
import CaretIcon from '../../assets/images/wallet-nav/caret-down.inline.svg';
import NavBarAddButton from './NavBarAddButton';

type Props = {|
  +headerComponent?: ?Node,
  +contentComponents?: ?Node,
|};

type State = {|
  isExpanded: boolean
|};

@observer
export default class NavDropdown extends Component<Props, State> {
  static defaultProps = {
    headerComponent: undefined,
    contentComponents: undefined,
  };

  state = {
    isExpanded: false,
  };

  toggleExpansion = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  }

  render() {
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
            onClick={this.toggleExpansion}
          >
            <CaretIcon />
          </button>
        </div>
        {isExpanded !== null && isExpanded && (
          <div className={styles.content}>
            {contentComponents}
            <div className={styles.buttonWrapper}>
              <NavBarAddButton onClick={() => {} /* TODO */} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import ArrowDownSVG from '../../assets/images/expand-arrow-grey.inline.svg';
import styles from './Accordion.scss';

type Props = {|
  +header: Node,
  +children: Node,
  activeHeader: boolean
|};

type State = {|
  isToggle: boolean,
|};

@observer
export default class Accordion extends Component<Props, State> {

  state: State = {
    isToggle: true,
  };

  toggleActive() {
    this.setState(prevState => ({ isToggle: !prevState.isToggle }));
  }

  render(): Node {
    const { header, children } = this.props;
    const { isToggle } = this.state;

    const activeButtonClasses = classnames([
      styles.accordionTitle,
      isToggle && styles.arrowUp,
      this.props.activeHeader && styles.activeHead
    ]);
    const toggleShowContent = classnames([
      styles.accordionContent,
      isToggle && styles.showActiveContent,
    ]);

    return (
      <div className={styles.accordionSection}>
        <button className={activeButtonClasses} onClick={this.toggleActive.bind(this)} type="button">
          {header}
          <span className={styles.arrowDownIcon}><ArrowDownSVG /></span>
        </button>
        <div className={toggleShowContent}>
          {children}
        </div>
      </div>
    );
  }
}

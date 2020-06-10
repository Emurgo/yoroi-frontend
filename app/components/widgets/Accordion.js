// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import ArrowDownSVG from '../../assets/images/expand-arrow-grey.inline.svg';
import styles from './Accordion.scss';
import AttentionIcon from '../../assets/images/attention-big-light.inline.svg';

type Props = {|
  +title: string,
  +children: Node,
|};

type State = {|
  active: boolean,
|};

@observer
export default class Accordion extends Component<Props, State> {

  state: State = {
    active: true,
  };

  toggleActive() {
    this.setState(prevState => ({ active: !prevState.active }));
  }

  render(): Node {
    const { title, children } = this.props;
    const { active } = this.state;

    const activeButtonClasses = classnames([
      styles.accordionTitle,
      active && styles.arrowUp,
    ]);
    const activeShowClasses = classnames([
      styles.accordionContent,
      active && styles.showActiveContent,
    ]);

    return (
      <div className={styles.accordionSection}>
        <button className={activeButtonClasses} onClick={this.toggleActive.bind(this)} type="button">
          <div> {title}
            <span className={styles.atentionIcon}>
              <AttentionIcon />
            </span>
          </div>
          <span className={styles.icon}><ArrowDownSVG /></span>
        </button>
        <div className={activeShowClasses}>
          {children}
        </div>

      </div>
    );
  }
}

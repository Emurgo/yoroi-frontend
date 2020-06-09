// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import classnames from 'classnames';

import ArrowDownSVG from '../../assets/images/expand-arrow-grey.inline.svg';
import styles from './Accordion.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
    active: false,
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
          <span>{title}</span>
          <span className={styles.icon}><ArrowDownSVG /></span>
        </button>
        <div className={activeShowClasses}>
          {children}
        </div>

      </div>
    );
  }
}

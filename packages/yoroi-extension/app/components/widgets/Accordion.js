// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import { ReactComponent as ArrowDownSVG } from '../../assets/images/expand-arrow-grey.inline.svg';
import styles from './Accordion.scss';

type Props = {|
  +header: Node,
  +children: Node,
  +activeHeader: boolean,
  +showSpinner: boolean,
  +style?: Object,
  +headerStyle?: Object,
|};

type State = {|
  isToggle: boolean,
|};

@observer
export default class Accordion extends Component<Props, State> {
  state: State = {
    isToggle: true,
  };

  toggleActive: void => void = () => {
    this.setState(prevState => ({ isToggle: !prevState.isToggle }));
  };

  render(): Node {
    const { header, children, style } = this.props;
    const { isToggle } = this.state;

    const activeButtonClasses = classnames([
      styles.accordionTitle,
      isToggle && styles.activeArrow,
      styles.revamp,
      this.props.activeHeader && styles.activeHead,
    ]);

    const toggleShowContent = classnames([
      styles.accordionContent,
      isToggle && styles.showActiveContent,
    ]);

    return (
      <div style={style} className={styles.accordionSection}>
        <button
          className={activeButtonClasses}
          onClick={this.toggleActive.bind(this)}
          type="button"
          style={this.props.headerStyle}
        >
          {header}
          <span className={styles.arrowIcon}>
            <ArrowDownSVG />
          </span>
        </button>
        <div className={toggleShowContent}>
          {children}
          {this.props.showSpinner ? <div className={styles.spinner} /> : null}
        </div>
      </div>
    );
  }
}

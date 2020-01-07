// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import styles from './PageSelect.scss';
import NavAll from '../../assets/images/widget/page-nav/arrow-all.inline.svg';
import NavSingle from '../../assets/images/widget/page-nav/arrow-single.inline.svg';

type Props = {|
  +currentPage: number;
  +numPages: number;
  +goToPage: number => void,
|};

@observer
export default class PageSelect extends Component<Props> {
  render() {
    const leftIsEnabled = this.props.currentPage <= 0
      ? styles.disabled
      : styles.enabled;
    const leftAll = classnames([styles.content, styles.left, leftIsEnabled]);
    const leftSingle = classnames([styles.content, styles.left, leftIsEnabled]);

    const rightIsEnabled = this.props.currentPage >= this.props.numPages - 1
      ? styles.disabled
      : styles.enabled;
    const rightSingle = classnames([styles.content, styles.right, rightIsEnabled]);
    const rightAll = classnames([styles.content, styles.right, rightIsEnabled]);

    const goIfEnabled = (enabled, page) => {
      if (enabled === styles.enabled) {
        this.props.goToPage(page);
      }
    };
    return (
      <div className={styles.component}>
        <NavAll style={{ marginRight: '16px' }} className={leftAll} onClick={() => goIfEnabled(leftIsEnabled, 0)} />
        <NavSingle style={{ marginRight: '40px' }} className={leftSingle} onClick={() => goIfEnabled(leftIsEnabled, this.props.currentPage - 1)} />
        <span className={styles.pageNum}>
          {this.props.numPages === 0
            ? 0
            : this.props.currentPage + 1
          }
        </span>
        <span className={styles.separator}>
          /
        </span>
        <span className={styles.pageNum}>
          {this.props.numPages}
        </span>
        <NavSingle style={{ marginLeft: '40px' }} className={rightSingle} onClick={() => goIfEnabled(rightIsEnabled, this.props.currentPage + 1)} />
        <NavAll style={{ marginLeft: '16px' }} className={rightAll} onClick={() => goIfEnabled(rightIsEnabled, this.props.numPages - 1)} />
      </div>
    );
  }
}

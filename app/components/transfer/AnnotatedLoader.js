// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import LoadingSpinner from '../widgets/LoadingSpinner';
import styles from './AnnotatedLoader.scss';

type Props = {|
  +title: string,
  +details: string,
|};

@observer
export default class AnnotatedLoader extends Component<Props> {

  render() {
    const { title, details } = this.props;

    return (
      <div className={styles.component}>
        <div className={styles.body}>
          <LoadingSpinner />
          <div className={styles.title}>{title}</div>
          <div className={styles.progressInfo}>{details}
          </div>
        </div>
      </div>
    );
  }
}

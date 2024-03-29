// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import LoadingSpinner from '../widgets/LoadingSpinner';
import styles from './AnnotatedLoader.scss';

type Props = {|
  +title: string,
  +details: string,
|};

@observer
export default class AnnotatedLoader extends Component<Props> {

  render(): Node {
    const { title, details } = this.props;

    return (
      <div className={styles.component}>
        <div className={styles.body}>
          <div className={styles.spinner}>
            <LoadingSpinner />
          </div>
          <div className={styles.title}>{title}</div>
          <div className={styles.progressInfo}>{details}
          </div>
        </div>
      </div>
    );
  }
}

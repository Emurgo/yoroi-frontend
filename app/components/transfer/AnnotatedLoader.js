// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import LoadingPaperWallet from '../widgets/LoadingPaperWallet';
import styles from './AnnotatedLoader.scss';

type Props = {
  title: string,
  details: string,
  warning?: string,
};

@observer
export default class AnnotatedLoader extends Component<Props> {
  static defaultProps = {
    warning: undefined,
  };

  render() {
    const { title, details, warning } = this.props;

    return (
      <div className={styles.component}>

        <div>
          <div className={styles.body}>

            <LoadingPaperWallet />

            <div className={styles.title}>
              {title}
            </div>

            <div className={styles.progressInfo}>
              {details}<br /><br />
              {warning &&
                <div className={styles.error}>
                  {warning}
                </div>
              }
            </div>
          </div>
        </div>

      </div>
    );
  }
}

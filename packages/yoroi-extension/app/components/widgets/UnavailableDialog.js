// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { ReactComponent as ErrorInfo }  from '../../assets/images/error-info.inline.svg';
import styles from './UnavailableDialog.scss';
import VerticallyCenteredLayout from '../layout/VerticallyCenteredLayout';

type Props = {|
  +children: Node,
  +title: string,
|};

@observer
export default class UnavailableDialog extends Component<Props> {
  render(): Node {
    return (
      <div className={styles.component}>
        <div className={styles.dialog}>
          <div className={styles.header}>
            <VerticallyCenteredLayout>
              <div className={styles.title}>{this.props.title}</div>
            </VerticallyCenteredLayout>
          </div>
          <div className={styles.errorLogo}>
            <ErrorInfo />
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

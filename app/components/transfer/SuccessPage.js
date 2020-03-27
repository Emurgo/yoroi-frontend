// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './SuccessPage.scss';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';

type Props = {|
  +title: string,
  +text: string,
  +classicTheme: boolean,
  +onClose: void => PossiblyAsync<void>,
  +closeLabel: string,
|};

@observer
export default class SuccessPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { title, text } = this.props;

    const actions = [
      {
        label: this.props.closeLabel,
        onClick: this.props.onClose,
        primary: true
      }
    ];

    return (
      <Dialog
        title=""
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onClose}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <div>
            <div className={styles.successImg} />
            <div className={styles.title}>
              {title}
            </div>
            <div className={styles.text}>
              {text}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

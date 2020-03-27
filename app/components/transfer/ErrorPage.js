// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import globalMessages from '../../i18n/global-messages';
import styles from './ErrorPage.scss';

type Props = {|
  +error?: ?LocalizableError,
  +onCancel: void => void,
  +title: string,
  +backButtonLabel: string,
  +classicTheme: boolean,
|};

@observer
export default class ErrorPage extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { error, onCancel, title, backButtonLabel, } = this.props;

    const actions = [
      {
        label: backButtonLabel,
        onClick: onCancel,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.errorLabel)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onCancel}
        className={styles.dialog}
      >
        <div className={styles.component}>
          <div>
            <div className={styles.body}>
              <div className={styles.title}>
                {title}
              </div>

              {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import globalMessages from '../../i18n/global-messages';
import styles from './ErrorPage.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +error?: ?LocalizableError,
  +onCancel: void => void,
  +title: string,
  +backButtonLabel: string,
  +classicTheme: boolean,
|};

@observer
export default class ErrorPage extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { error, onCancel, title, backButtonLabel } = this.props;

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
      >
        <div className={styles.component}>
          <div>
            <div className={styles.body}>
              <div className={styles.title}>{title}</div>
              {error && <div className={styles.error}>{intl.formatMessage(error, error.values)}</div>}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

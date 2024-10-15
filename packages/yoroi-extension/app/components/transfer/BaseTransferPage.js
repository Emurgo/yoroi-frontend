// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import DialogBackButton from '../widgets/DialogBackButton';
import Dialog from '../widgets/Dialog';
import styles from './BaseTransferPage.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';

type Props = {|
  +children: Node,
  +onSubmit: void => Promise<void>,
  +onBack: void => void,
  +step0: string,
  +isDisabled: boolean,
  +error?: ?LocalizableError,
|};

@observer
export default class BaseTransferPage extends Component<Props> {

  static defaultProps: {|error: void|} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const {
      onBack,
      step0,
    } = this.props;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: onBack,
        className: classnames(['backTransferButtonClasses']),
      },
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        onClick: this.props.onSubmit,
        primary: true,
        className: classnames(['proceedTransferButtonClasses']),
        disabled: this.props.isDisabled,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.instructionTitle)}
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={onBack}
        className={styles.dialog}
        backButton={<DialogBackButton onBack={onBack} />}
      >
        <div className={styles.component}>
          <div className={styles.body}>
            <div>
              <ul className={styles.instructionsList}>
                <div className={styles.text}>
                  {step0}
                  <br /><br />
                  {intl.formatMessage(globalMessages.step1)}
                </div>
              </ul>
            </div>
            {this.props.children}
            {this.props.error && (
              <div className={styles.error}>
                {intl.formatMessage(this.props.error, this.props.error.values)}
              </div>
            )}
          </div>
        </div>
      </Dialog>
    );
  }
}

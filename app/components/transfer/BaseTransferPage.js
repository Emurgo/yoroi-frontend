// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import DialogBackButton from '../widgets/DialogBackButton';
import Dialog from '../widgets/Dialog';
import styles from './BaseTransferPage.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +children: Node,
  +onSubmit: void => Promise<void>,
  +onBack: void => void,
  +step0: string,
  +isDisabled: boolean
|};

@observer
export default class BaseTransferPage extends Component<Props> {

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
        actions={actions}
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
          </div>
        </div>
      </Dialog>
    );
  }
}

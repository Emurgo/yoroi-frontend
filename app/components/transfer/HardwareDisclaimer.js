// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import { defineMessages, intlShape } from 'react-intl';
import DialogBackButton from '../widgets/DialogBackButton';
import Dialog from '../widgets/Dialog';
import styles from './HardwareDisclaimer.scss';
import globalMessages from '../../i18n/global-messages';

const messages = defineMessages({
  instructions2: {
    id: 'transfer.instructions.hardware.disclaimer.instructions2',
    defaultMessage: '!!!If you use this feature, you should generate a new recovery phrase for your hardware wallet. If you don\'t know why or how to do this, we do not recommend you use this feature.',
  },
  hardwareDisclaimer: {
    id: 'transfer.instructions.hardware.disclaimer.checkbox',
    defaultMessage: '!!!I acknowledge that entering my hardware wallet\'s recovery phrase carries significant risk.',
  },
});

type Props = {|
  +onBack: void => void,
  +onNext: void => void,
  +isChecked: boolean,
  +toggleCheck: void => void,
|};

@observer
export default class HardwareDisclaimer extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: this.props.onBack,
      },
      {
        label: intl.formatMessage(globalMessages.uriLandingDialogConfirmLabel),
        onClick: this.props.onNext,
        primary: true,
        disabled: !this.props.isChecked,
      },
    ];

    const title = (
      <>
        <span className={styles.headerIcon} />
        {intl.formatMessage(globalMessages.attentionTitle)}
      </>
    );
    return (
      <Dialog
        title={title}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onBack}
        backButton={<DialogBackButton onBack={this.props.onBack} />}
      >
        <div className={styles.component}>
          <div>
            <div className={styles.body}>
              <p className={styles.message}>
                {intl.formatMessage(globalMessages.hardwareTransferInstructions)}<br /><br />
                {intl.formatMessage(messages.instructions2)}
              </p>

              <div className={styles.checkbox}>
                <Checkbox
                  label={intl.formatMessage(messages.hardwareDisclaimer)}
                  onChange={this.props.toggleCheck}
                  checked={this.props.isChecked}
                  skin={CheckboxSkin}
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

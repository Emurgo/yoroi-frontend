// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import DialogBackButton from '../widgets/DialogBackButton';
import Dialog from '../widgets/Dialog';
import styles from './RewardClaimDisclaimer.scss';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  disclaimer: {
    id: 'transfer.instructions.fee.source.disclaimer',
    defaultMessage: '!!!The transaction fee to claim funds will be paid by the wallet you currently have selected.'
  },
});

type Props = {|
  +onBack: void => void,
  +onNext: void => void,
|};

@observer
export default class RewardClaimDisclaimer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.uriLandingDialogConfirmLabel),
        primary: true,
        onClick: this.props.onNext,
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
              <div className={styles.message}>
                {intl.formatMessage(messages.disclaimer)}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

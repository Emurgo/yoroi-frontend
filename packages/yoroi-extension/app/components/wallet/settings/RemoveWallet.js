// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import styles from './RemoveWallet.scss';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';

export const messages: * = defineMessages({
  titleLabel: {
    id: 'wallet.settings.remove.label',
    defaultMessage: '!!!Remove wallet',
  },
  removeExplanation: {
    id: 'wallet.settings.remove.explanation',
    defaultMessage:
      '!!!Removing a wallet does not affect the wallet balance. Your wallet can be restored again at any time.',
  },
});

type Props = {|
  +walletName: string,
  +openDialog: void => void,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class RemoveWallet extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { openDialog, isRevampLayout } = this.props;

    return (
      <div className={styles.component}>
        <h2>{intl.formatMessage(messages.titleLabel)}</h2>
        <p>{intl.formatMessage(messages.removeExplanation)}</p>

        <Button
          variant={isRevampLayout ? 'contained' : 'danger'}
          color="error"
          className="removeWallet"
          onClick={openDialog}
          sx={{ marginTop: '20px', width: '400px' }}
        >
          {`${this.context.intl.formatMessage(globalMessages.remove)} ${this.props.walletName}`}
        </Button>
      </div>
    );
  }
}

export default (withLayout(RemoveWallet): ComponentType<Props>);

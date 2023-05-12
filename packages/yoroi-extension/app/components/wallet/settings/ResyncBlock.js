// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './ResyncBlock.scss';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { withLayout } from '../../../styles/context/layout';

export const messages: * = defineMessages({
  titleLabel: {
    id: 'wallet.settings.resync.label',
    defaultMessage: '!!!Resync wallet with the blockchain',
  },
  resyncExplanation: {
    id: 'wallet.settings.resync.explanation',
    defaultMessage:
      '!!!If you are experiencing issues with your wallet, or think you have an incorrect balance or transaction history, you can delete the local data stored by Yoroi and resync with the blockchain.',
  },
});

type Props = {|
  openDialog: void => void,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class ResyncBlock extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isRevampLayout, openDialog } = this.props;

    return (
      <div className={styles.component}>
        <h2>{intl.formatMessage(messages.titleLabel)}</h2>
        <p>{intl.formatMessage(messages.resyncExplanation)}</p>

        <Button
          variant={isRevampLayout ? 'contained' : 'primary'}
          className="resyncButton"
          onClick={openDialog}
          sx={{ marginTop: '20px', width: '400px' }}
        >
          {this.context.intl.formatMessage(globalMessages.resyncButtonLabel)}
        </Button>
      </div>
    );
  }
}

export default (withLayout(ResyncBlock): ComponentType<Props>);

// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import styles from './ExportWallet.scss';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';

export const messages: any = defineMessages({
  titleLabel: {
    id: 'wallet.settings.export.label',
    defaultMessage: '!!!Export wallet',
  },
  exportExplanation: {
    id: 'wallet.settings.export.explanation',
    defaultMessage: '!!!This can be used to transfer a wallet between devices.',
  },
});

type Props = {|
  +openDialog: void => void,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class ExportWallet extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isRevampLayout, openDialog } = this.props;

    return (
      <div className={styles.component}>
        <h2>{intl.formatMessage(messages.titleLabel)}</h2>
        <p>{intl.formatMessage(messages.exportExplanation)}</p>

        <Button
          variant={isRevampLayout ? 'contained' : 'primary'}
          className="exportWallet"
          onClick={openDialog}
          sx={{ marginTop: '20px', width: '400px' }}
        >
          {`${this.context.intl.formatMessage(globalMessages.exportButtonLabel)}`}
        </Button>
      </div>
    );
  }
}

export default (withLayout(ExportWallet): ComponentType<Props>);

// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TransferCards from './TransferCards';
import styles from './TransferTypeSelect.scss';
import { handleExternalLinkClick } from '../../../utils/routing';
import { Box, Link, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';

type Props = {|
  +onByron: void => void,
  +ticker: string,
|};

const messages = defineMessages({
  instruction: {
    id: 'wallet.transfer.instruction',
    defaultMessage: '!!!Any {ticker} claimed will be transferred to your currently selected wallet',
  },
  subInstruction: {
    id: 'wallet.transfer.subInstruction',
    defaultMessage: '!!!Learn more about Byron and Shelley eras and how to claim ADA on our',
  },
});

@observer
export default class TransferTypeSelect extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const faqLink = (
      <Link
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => handleExternalLinkClick(event)}
        id="settings:support-faq-link"
      >
        FAQ
      </Link>
    );

    return (
      <Box height="100%">
        <Box min-height="100%" display="flex" flexDirection="column" alignItems="center">
          <Box display="flex" flexDirection="column" alignItems="center" marginBottom="40px">
            <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
              {intl.formatMessage(messages.instruction, { ticker: this.props.ticker })}
            </Typography>
            <Typography variant="body1" color="ds.text_gray_medium">
              {intl.formatMessage(messages.subInstruction, { ticker: this.props.ticker })}
              &nbsp;
              {faqLink}
            </Typography>
          </Box>
          <TransferCards onByron={this.props.onByron} />
        </Box>
      </Box>
      // <div className={styles.component}>
      //   <div className={styles.hero}>
      //     <div className={styles.instructions}>
      //       <div className={styles.headerText}>
      //         {intl.formatMessage(
      //           messages.instruction,
      //           { ticker: this.props.ticker }
      //         )}
      //       </div>
      //       <span>
      //         {intl.formatMessage(
      //           messages.subInstruction,
      //           { ticker: this.props.ticker }
      //         )}
      //         <a onClick={event => handleExternalLinkClick(event)} href="https://yoroi-wallet.com/#/faq/1"> FAQ</a>
      //       </span>
      //     </div>
      //     <TransferCards onByron={this.props.onByron} />
      //   </div>
      // </div>
    );
  }
}

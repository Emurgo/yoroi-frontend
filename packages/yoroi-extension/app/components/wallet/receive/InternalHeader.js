// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import WarningHeader from './WarningHeader';
import { addressSubgroupName } from '../../../types/AddressFilterTypes';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './InternalHeader.scss';
import { Typography } from '@mui/material';

const messages = defineMessages({
  warning1: {
    id: 'wallet.receive.page.internalWarning1',
    defaultMessage:
      '!!!Internal addresses (or "change" addresses) maintain your privacy by obscuring which addresses belong to you on the blockchain',
  },
  blogLinkUrl: {
    id: 'wallet.receive.page.internal.learnMore',
    defaultMessage: '!!!https://emurgo.io/en/blog/understanding-unspent-transaction-outputs-in-cardano',
  },
});

type Props = {|
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class InternalHeader extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const blogLink = (
      <a
        className={styles.link}
        href={intl.formatMessage(messages.blogLinkUrl)}
        onClick={event => this.props.onExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.blogLinkWrapper)}
      </a>
    );
    return (
      <WarningHeader
        message={
          <div className={styles.component}>
            <Typography variant="caption" color="ds.text_gray_medium">
              {intl.formatMessage(messages.warning1)}
            </Typography>
            <br />
            <Typography
              variant="caption"
              color="ds.text_gray_medium"
              sx={{ '& .InternalHeader_link': { px: '2px', color: 'ds.sys_cyan_500' } }}
            >
              <FormattedMessage {...globalMessages.blogLearnMore} values={{ blogLink }} />
            </Typography>
            <Typography variant="caption" color="ds.text_gray_medium">
              {intl.formatMessage(addressSubgroupName.internal)}&nbsp;
              <FormattedHTMLMessage {...globalMessages.auditAddressWarning} />
            </Typography>
          </div>
        }
      />
    );
  }
}

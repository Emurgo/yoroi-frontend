// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import Dialog from '../../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../../widgets/Dialog/DialogCloseButton';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Link, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { HelperTooltip } from './StakePool/StakePool';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import styles from '../dashboard/UserSummary.scss';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import type { TokenEntry, TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../../utils/strings';
import { truncateToken } from '../../../../utils/formatters';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';

const messages = defineMessages({
  overviewContent: {
    id: 'wallet.staking.overviewContent',
    defaultMessage:
      '!!!Your rewards are automatically staked. You don’t need to withdraw it everytime because you pay a transaction fee.',
  },
  availableTotalRewards: {
    id: 'wallet.staking.availableTotalRewards',
    defaultMessage: '!!!Available Total Rewards',
  },
  availableTotalRewardsHelper: {
    id: 'wallet.staking.availableTotalRewardsHelper',
    defaultMessage:
      '!!!If the Reward amount is different than expected, see possible reasons of that on our {faqLink}.',
  },
  FAQPage: {
    id: 'wallet.staking.FAQPage',
    defaultMessage: '!!!FAQ page'
  }
});

type Props = {|
  onClose: void => void,
  +withdrawRewards: void | (void => void),
  +shouldHideBalance: boolean,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +unitOfAccount: TokenEntry => void | {| currency: string, amount: string |},
  +totalRewards: void | MultiToken,
|};

@observer
export default class OverviewModal extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { withdrawRewards, onClose, totalRewards } = this.props;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: () => onClose(),
        disabled: false,
      },
      {
        label: intl.formatMessage(globalMessages.withdrawLabel),
        primary: true,
        onClick: () => withdrawRewards?.(),
        disabled: withdrawRewards == null,
      },
    ];

    const faqLink = (
      <Link
        href="https://emurgohelpdesk.zendesk.com"
        target='_blank'
        rel="noreferrer noopener"
        sx={{
          color: 'inherit',
          textDecoration: 'underline',
        }}
      >
        {intl.formatMessage(messages.FAQPage)}
      </Link>
    )
    return (
      <Dialog
        title={this.context.intl.formatMessage(globalMessages.overview)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton onClose={onClose} />}
        onClose={onClose}
      >
        <Typography component="div" color="var(--yoroi-palette-gray-900)">
          {intl.formatMessage(messages.overviewContent)}
        </Typography>
        <Box display="flex" alignItems="center" py="50px">
          <Box display="flex" alignItems="center" flex="1">
            <Typography component="div" mr="6px">{intl.formatMessage(messages.availableTotalRewards)}</Typography>
            <HelperTooltip
              message={
                <FormattedMessage
                  {...messages.availableTotalRewardsHelper}
                  values={{ faqLink }}
                />
              }
            />
          </Box>

          <Box flex="1">
            <Typography component="div" variant="h1" fontWeight="400" color="var(--yoroi-palette-gray-900)">
              {this.renderAmount(totalRewards)}
            </Typography>
            <Typography component="div" variant="body1" color="var(--yoroi-palette-gray-900)">
              {this.renderAmountWithUnitOfAccount(totalRewards)}
            </Typography>
          </Box>
        </Box>
      </Dialog>
    );
  }

  formatTokenEntry: TokenEntry => Node = tokenEntry => {
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    const splitAmount = tokenEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .toFormat(tokenInfo.Metadata.numberOfDecimals)
      .split('.');

    const amountNode = this.props.shouldHideBalance ? (
      hiddenAmount
    ) : (
      <>
        {splitAmount[0]}
        <span>.{splitAmount[1]} </span>
      </>
    );
    return (
      <>
        <span>{amountNode} </span>
        {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };

  renderAmount: (void | MultiToken) => Node = token => {
    if (token == null) {
      return (
        <div className={styles.loadingSpinner}>
          <LoadingSpinner small />
        </div>
      );
    }

    return this.formatTokenEntry(token.getDefaultEntry());
  };

  renderAmountWithUnitOfAccount: (void | MultiToken) => Node = token => {
    if (token == null) {
      return null;
    }

    const unitOfAccountCalculated = this.props.unitOfAccount(token.getDefaultEntry());

    if (!unitOfAccountCalculated) {
      return null;
    }

    if (this.props.shouldHideBalance) {
      return `${hiddenAmount}  ${unitOfAccountCalculated.currency}`;
    }

    return `${unitOfAccountCalculated.amount} ${unitOfAccountCalculated.currency}`;
  };
}

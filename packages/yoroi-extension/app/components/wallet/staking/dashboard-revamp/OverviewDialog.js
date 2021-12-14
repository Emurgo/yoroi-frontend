// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Typography } from '@mui/material';
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
      '!!!If the Reward amount is different than expected, see possible reasons of that on our FAQ page.',
  },
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

    return (
      <Dialog
        title={this.context.intl.formatMessage(globalMessages.overview)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton onClose={onClose} />}
        onClose={onClose}
      >
        <Typography color="var(--yoroi-palette-gray-900)">
          {intl.formatMessage(messages.overviewContent)}
        </Typography>
        <Box display="flex" alignItems="center" py="50px">
          <Box display="flex" alignItems="center" flex="1">
            <Typography mr="6px">{intl.formatMessage(messages.availableTotalRewards)}</Typography>
            <HelperTooltip message={intl.formatMessage(messages.availableTotalRewardsHelper)} />
          </Box>

          <Box flex="1">
            <Typography variant="h1" fontWeight="400" color="var(--yoroi-palette-gray-900)">
              {this.renderAmount(totalRewards)}
            </Typography>
            <Typography variant="body1" color="var(--yoroi-palette-gray-900)">
              {this.renderAmount(totalRewards)} USD
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
    const unitOfAccountCalculated = this.props.unitOfAccount(token.getDefaultEntry());

    const entryNode = this.formatTokenEntry(token.getDefaultEntry());
    const unitOfAccountNode = unitOfAccountCalculated
      ? `${unitOfAccountCalculated.amount} ${unitOfAccountCalculated.currency}`
      : null;

    return (
      <>
        {unitOfAccountNode}
        {entryNode}
      </>
    );
  };
}

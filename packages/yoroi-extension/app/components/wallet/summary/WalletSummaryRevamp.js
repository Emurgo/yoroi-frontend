// @flow
import type { Node } from 'react';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { UnconfirmedAmount } from '../../../types/unconfirmedAmount.types';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletSummary.scss';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { formatValue } from '../../../utils/unit-of-account';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../utils/strings';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import { Button, Typography, Grid, Stack } from '@mui/material';
import { Box } from '@mui/system';
import BigNumber from 'bignumber.js';
import { ReactComponent as ExportTxToFileSvg } from '../../../assets/images/transaction/export.inline.svg';
import LoadingSpinner from '../../widgets/LoadingSpinner';
import FullscreenLayout from '../../layout/FullscreenLayout';
// $FlowIgnore: supressing this error
import { BringBanner, UsdaBanner } from '../../../UI/components/Banners';
import { ROUTES } from '../../../routes-config';
import LocalStorageApi from '../../../api/localStorage';
import type { WalletState } from '../../../../chrome/extension/background/types';
import environment from '../../../environment';
// $FlowIgnore: suppressing this error
import { DrepPromotionBanner } from '../../../UI/components/DrepPromotionBanner/DrepPromotionBanner';
import type { StoresMap } from '../../../stores';

const messages = defineMessages({
  transactionType: {
    id: 'wallet.summary.page.type',
    defaultMessage: '!!!Transaction type',
  },
  transactionStatus: {
    id: 'wallet.summary.page.status',
    defaultMessage: '!!!Status',
  },
  pendingOutgoingConfirmationLabel: {
    id: 'wallet.summary.page.pendingOutgoingConfirmationLabel',
    defaultMessage: '!!!Outgoing pending confirmation',
  },
  pendingIncomingConfirmationLabel: {
    id: 'wallet.summary.page.pendingIncomingConfirmationLabel',
    defaultMessage: '!!!Incoming pending confirmation',
  },
});

type Props = {|
  +shouldHideBalance: boolean,
  +pendingAmount: UnconfirmedAmount,
  +isLoadingTransactions: boolean,
  +openExportTxToFileDialog: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +getHistoricalPrice: (from: string, to: string, timestamp: number) => ?string,
  +shouldShowEmptyBanner: boolean,
  +emptyBannerComponent: Node,
  +goToRoute: ({| route: string, params?: Object, delegateToYoroiDrep?: null | boolean |}) => void,
  +selectedWallet: WalletState,
  +stores: StoresMap,
|};

type State = {|
  isBannerVisible: boolean,
|};

const localStorage = new LocalStorageApi();

@observer
export default class WalletSummaryRevamp extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isBannerVisible: false,
  };

  UNSAFE_componentWillMount: void => Promise<void> = async () => {
    const wasClosed = await localStorage.getBringBannerClosed();
    if (!wasClosed) {
      this.setState({ isBannerVisible: true });
    }
  };

  renderAmountDisplay: ({|
    shouldHideBalance: boolean,
    amount: MultiToken,
  |}) => Node = request => {
    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = <span>{hiddenAmount}</span>;
    } else {
      const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    return (
      <>
        {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };

  getWalletBalance: ({|
    shouldHideBalance: boolean,
    amount: MultiToken,
  |}) => Node = request => {
    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);

    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
    const [beforeDecimal] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

    return beforeDecimal;
  };

  renderPendingAmount(timestampedAmount: Array<{| amount: MultiToken, timestamp: number |}>, label: string): Node {
    if (!timestampedAmount.length) {
      return null;
    }

    const { getHistoricalPrice, unitOfAccountSetting, shouldHideBalance, getTokenInfo } = this.props;

    let pendingAmount = null;
    if (unitOfAccountSetting.enabled) {
      const { currency } = unitOfAccountSetting;
      if (!currency) {
        throw new Error(`unexpected unit of account ${String(currency)}`);
      }
      if (shouldHideBalance) {
        pendingAmount = (
          <>
            <span>{hiddenAmount}</span>
            &nbsp;
            {currency}
          </>
        );
      } else {
        let totalFiatAmount = new BigNumber('0');
        for (const { amount, timestamp } of timestampedAmount) {
          const tokenEntry = amount.getDefaultEntry();
          const tokenInfo = getTokenInfo(tokenEntry);
          const ticker = tokenInfo.Metadata.ticker;
          if (ticker == null) {
            throw new Error('unexpected main token type');
          }

          const price = getHistoricalPrice(ticker, currency, timestamp);
          if (price == null) {
            totalFiatAmount = null;
            break;
          }
          totalFiatAmount = totalFiatAmount.plus(
            tokenEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals).multipliedBy(price)
          );
        }
        if (totalFiatAmount) {
          const [beforeDecimal, afterDecimal] = formatValue(totalFiatAmount).split('.');

          pendingAmount = (
            <>
              {beforeDecimal}
              {afterDecimal && <span className={styles.afterDecimal}>.{afterDecimal}</span>}
              &nbsp;
              {currency}
            </>
          );
        }
      }
    }

    if (!pendingAmount) {
      pendingAmount = this.renderAmountDisplay({
        shouldHideBalance,
        amount: timestampedAmount
          .map(({ amount }) => amount)
          .reduce((accuAmount, curAmount) => accuAmount.joinAddCopy(curAmount)),
      });
    }

    return (
      <div className={styles.pendingConfirmation}>
        {label}:&nbsp;
        <span className={styles.amount}>{pendingAmount}</span>
      </div>
    );
  }

  renderBringBanner(): Node {
    const { goToRoute, selectedWallet } = this.props;
    const { isBannerVisible } = this.state;

    // <TODO:UNFLAG_LATER>
    if (!environment.isDev()) return null;

    if (selectedWallet.isTestnet || !isBannerVisible) return null;

    return (
      <BringBanner
        onClose={() => {
          this.setState({ isBannerVisible: false });
          localStorage.setBringBannerClosed('true');
        }}
        onClick={() => goToRoute({ route: ROUTES.CASHBACK.ROOT })}
        displayIllustration={false}
      />
    );
  }

  renderUsdaBanner(): Node {
    const { goToRoute } = this.props;

    // <TODO:UNBLOCK_LATER>
    // noinspection PointlessBooleanExpressionJS
    if (true) return null;

    // noinspection UnreachableCodeJS
    return (
      <UsdaBanner
        onClose={() => {}}
        onClick={() => goToRoute({ route: ROUTES.SWAP.ROOT })}
      />
    );
  }

  render(): Node {
    const {
      pendingAmount,
      isLoadingTransactions,
      openExportTxToFileDialog,
      shouldShowEmptyBanner,
      emptyBannerComponent,
      stores,
    } = this.props;
    const { intl } = this.context;

    const hasPendingAmount = pendingAmount.incoming.length || pendingAmount.outgoing.length;

    if (isLoadingTransactions)
      return (
        <FullscreenLayout bottomPadding={0}>
          <Stack alignItems="center" justifyContent="center" height="50vh">
            <LoadingSpinner />
          </Stack>
        </FullscreenLayout>
      );

    return (
      <Box id="wallet:transactions-walletSummary-box" sx={{ bgcolor: 'ds.bg_color_max' }}>
        <Box
          sx={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h2" as="p" fontSize="18px" sx={{ fontWeight: 500, color: 'ds.text_gray_medium' }}>
            {intl.formatMessage(globalMessages.transactions)}
          </Typography>

          {!isLoadingTransactions && (
            <Button
              variant="tertiary"
              color="primary"
              sx={{
                textTransform: 'uppercase',
                margin: '2px',
                lineHeight: '21px',
                color: 'ds.text_primary_medium',
              }}
              onClick={openExportTxToFileDialog}
              onKeyPress={openExportTxToFileDialog}
              startIcon={<ExportTxToFileSvg />}
              id="wallet:transactions:walletSummary-openExportWindow-button"
            >
              {intl.formatMessage(globalMessages.exportButtonLabel)}
            </Button>
          )}
        </Box>
        <Box sx={{ pb: hasPendingAmount ? '16px' : 0 }}>
          <Typography component="div" variant="body1">
            {this.renderPendingAmount(pendingAmount.incoming, intl.formatMessage(messages.pendingIncomingConfirmationLabel))}
          </Typography>
          <Typography component="div" variant="body1">
            {this.renderPendingAmount(pendingAmount.outgoing, intl.formatMessage(messages.pendingOutgoingConfirmationLabel))}
          </Typography>
        </Box>
        <DrepPromotionBanner stores={stores} intl={intl} />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '24px' }}>
          {this.renderBringBanner()}
          {this.renderUsdaBanner()}
        </Box>
        {shouldShowEmptyBanner && <Box>{emptyBannerComponent}</Box>}
        {!shouldShowEmptyBanner && !isLoadingTransactions && (
          <Grid
            container
            sx={{
              width: '100%',
              padding: '12px 0',
              borderBottom: '1px solid',
              borderBottomColor: 'grayscale.200',
            }}
          >
            <Grid item xs={4}>
              <Typography variant="body2" color="ds.text_gray_low">
                {intl.formatMessage(messages.transactionType)}
              </Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'left' }}>
              <Typography variant="body2" color="ds.text_gray_low">
                {intl.formatMessage(messages.transactionStatus)}
              </Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'right' }} color="ds.text_gray_low">
              <Typography variant="body2">{intl.formatMessage(globalMessages.feeLabel)}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right', pr: '30px' }} color="ds.text_gray_low">
              <Typography component="div" variant="body2">
                {intl.formatMessage(globalMessages.amountLabel)}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Box>
    );
  }
}

export const columnTXStyles = {
  transactionType: { flex: '1 1 30%', maxWidth: '30%', textAlign: 'left', color: 'grayscale.600' },
  status: { flex: '1 1 16%', maxWidth: '16%', textAlign: 'left', color: 'grayscale.600' },
  fee: { flex: '1 1 16%', maxWidth: '16%', textAlign: 'right', color: 'grayscale.600' },
  amount: {
    flex: '1 1 25%',
    maxWidth: '25%',
    paddingRight: '24px',
    textAlign: 'right',
    color: 'grayscale.600',
  },
};

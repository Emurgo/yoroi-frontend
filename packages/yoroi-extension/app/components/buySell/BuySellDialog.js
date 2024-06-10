// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../widgets/Dialog/legacy/Dialog';
import DialogCloseButton from '../widgets/Dialog/DialogCloseButton';

import globalMessages from '../../i18n/global-messages';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tab, { tabClasses } from '@mui/material/Tab';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import BigNumber from 'bignumber.js';
import adaPng from '../../assets/images/ada.png';
import banxaPng from '../../assets/images/banxa.png';
import encryptusPng from '../../assets/images/encryptus.png';
import { ReactComponent as InfoIcon } from '../../assets/images/info-icon-revamp.inline.svg';
import { exchangeApiMaker, exchangeManagerMaker } from '@yoroi/exchange'

declare var chrome;

const messages = defineMessages({
  dialogTitle: {
    id: 'buysell.dialog.title',
    defaultMessage: '!!!Exchange ADA',
  },
  adaAmount: {
    id: 'buysell.dialog.adaAmount',
    defaultMessage: '!!!ADA Amount',
  },
  currentBalance: {
    id: 'buysell.dialog.currentBalance',
    defaultMessage: '!!!Current balance: {amount} ADA',
  },
  lessThanMinimum: {
    id: 'buysell.dialog.error.minimum',
    defaultMessage: '!!!Minimum {amount} ADA required',
  },
  notEnoughBalance: {
    id: 'buysell.dialog.error.not.enough',
    defaultMessage: '!!!Not enough balance',
  },
  providerFee: {
    id: 'buysell.dialog.providerFee',
    defaultMessage: '!!!Provider fee',
  },
  disclaimer: {
    id: 'buysell.dialog.disclaimer',
    defaultMessage: '!!!Disclaimer',
  },
  disclaimerText: {
    id: 'buysell.dialog.disclaimerText',
    defaultMessage: '!!!Yoroi Wallet utilizes third-party web3 on-and-off ramp solutions for direct Fiat-ADA exchanges.  By clicking "Proceed," you acknowledge that you will be redirected to our partner\'s website, where you may need to accept their terms and conditions.  Please note, the third party web3 solution may have limitations based on your location and financial institution.'
  },
  proceed: {
    id: 'buysell.dialog.proceed',
    defaultMessage: 'PROCEED',
  },
});

type Props = {|
  +onCancel: void => void,
  +onExchangeCallback: void => void,
  +currentBalanceAda: string,
  +receiveAdaAddressPromise: Promise<string | null>,
|};

type State = {|
  +isBuying: boolean,
  +error: null | 'lessThanBuyMinimum' | 'notEnoughBalance' | 'lessThanSellMinimum',
  +amountAda: string,
  +isSubmitting: boolean,
|};

const MINIMUM_BUY_ADA = new BigNumber('100');
const MINIMUM_SELL_ADA = new BigNumber('1');
const EXCHANGE_CALLBACK_URL = 'https://ramp-redirect.yoroiwallet.com/yoroi-extension-exchange-callback.html';

const TabItem = styled(Tab)({
  position: 'relative',
  borderRadius: '8px',
  textAlign: 'center',
  transition: 'all .5s',
  padding: '10px 15px',
  color: '#555555',
  height: 'auto',
  margin: '10px 0',
  float: 'none',
  fontSize: '12px',
  fontWeight: '500',
  [`&.${tabClasses.selected}, &.${tabClasses.root}:hover`]: {
    color: '#555555',
    backgroundColor: '#dce0e9',
  },
});

const ProviderRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '16px',
  '& .provider-logo': {
    width: '48px',
    height: '48px',
  },
  '& .provider-name-fee': {
    marginLeft: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  '& .provider-name': {
    fontFamily: 'Rubik',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
    textAlign: 'left',
  },
  '& .provider-fee': {
    fontFamily: 'Rubik',
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
    letterSpacing: '0.2px',
    textAlign: 'left',
  },
});

const Disclaimer = styled(Box)(({ theme }) => ({
  color: theme.palette.ds.gray_c900,
  fontFeatureSettings: `'clig' off, 'liga' off`,
  fontFamily: 'Rubik',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '24px',
  marginBottom: '140px',
  '& header': {
    fontWeight: 500,
    '& svg': {
      verticalAlign: 'text-bottom',
      marginRight: '8px',
    },
  },
  borderRadius: 'var(--corner-radius-8, 8px)',
  background: theme.palette.ds.bg_gradient_1,
  padding:
    'var(--spacing-12, 12px) var(--spacing-16, 16px) var(--spacing-16, 16px) var(--spacing-16, 16px)',
}));

@observer
export default class BuySellDialog extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isBuying: true,
    error: null,
    amountAda: '',
    isSubmitting: false,
  };

  onSubmit: () => Promise<void> = async () => {
    const { state, props } = this;

    this.setState({ isSubmitting: true });
    const api = exchangeApiMaker({ isProduction: true, partner: 'yoroi' });
    const manager = exchangeManagerMaker({ api });

    let params;
    if (state.isBuying) {
      params = {
        providerId: 'banxa',
        queries: {
          fiatType: 'USD',
          coinType: 'ADA',
          walletAddress: await props.receiveAdaAddressPromise,
          orderType: 'buy',
          returnUrl: EXCHANGE_CALLBACK_URL,
          coinAmount: Number(state.amountAda),
          balance: props.currentBalanceAda,
        }
      }
    } else {
      params = {
        providerId: 'encryptus',
        queries: {
          fiatType: 'USD',
          coinType: 'ADA',
          walletAddress: await props.receiveAdaAddressPromise,
          orderType: 'sell',
          returnUrl: EXCHANGE_CALLBACK_URL,
          coinAmount: Number(state.amountAda),
          balance: props.currentBalanceAda,
        }
      }
    }

    const url = await manager.referralLink.create(params);

    const self = this;
    chrome.tabs.create({ url: url.href }, (exchangePageTab) => {
      chrome.tabs.onRemoved.addListener((tabId) => {
        if (tabId === exchangePageTab.id) {
          self.setState({ isSubmitting: false });
        }
      });

      chrome.runtime.onMessage.addListener((message, sender) => {
        if (message.type === 'exchange callback' && sender.tab.id === exchangePageTab.id) {
          chrome.tabs.remove(sender.tab.id);
          props.onExchangeCallback();
        }
      });
    });
  }

  onChangeAmount: (SyntheticInputEvent<HTMLInputElement>) => void = (event) => {
    const { value } = event.target;

    if (!value.match(/^\d*$/)) {
      return;
    }

    const error = (() => {
      if (value === '') {
        return null;
      }
      if (this.state.isBuying) {
        if (MINIMUM_BUY_ADA.gt(value)) {
          return 'lessThanBuyMinimum';
        }
      } else {
        if (MINIMUM_SELL_ADA.gt(value)) {
          return 'lessThanSellMinimum';
        }
        if (MINIMUM_SELL_ADA.gt(this.props.currentBalanceAda)) {
          return 'notEnoughBalance';
        }
        if (new BigNumber(value).gt(this.props.currentBalanceAda)) {
          return 'notEnoughBalance';
        }
      }
      return null;
    })();

    this.setState({ amountAda: value, error });
  }

  renderBuySell(): Node {
    const { intl } = this.context;
    const { state, props } = this;

    const [ providerLogo, providerName ] = state.isBuying ? [
      banxaPng, 'Banxa'
    ] : [
      encryptusPng, 'Encryptus'
    ];

    // set a place holder so that when it becomes an error message, the height doesn't change
    let helperText = ' ';
    if (state.error === 'lessThanBuyMinimum') {
      helperText = intl.formatMessage(messages.lessThanMinimum, { amount: MINIMUM_BUY_ADA.toString() });
    } else if (state.error === 'lessThanSellMinimum') {
      helperText = intl.formatMessage(messages.lessThanMinimum, { amount: MINIMUM_SELL_ADA.toString() });
    } else if (state.error === 'notEnoughBalance') {
      helperText = intl.formatMessage(messages.notEnoughBalance);
    }

    return (
      <>
        <TextField
          label={intl.formatMessage(messages.adaAmount)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <div
                  style={{
                    position: 'relative' /* so that the balance line can align on the right side */,
                  }}
                >
                  <Box sx={{ color: 'ds.gray_cmax' }} style={{ marginBottom: '8px' }}>
                    <img
                      style={{ marginRight: '8px', borderRadius: '4px', verticalAlign: 'bottom' }}
                      src={adaPng}
                      alt=""
                    />
                    ADA
                  </Box>
                  <Box sx={{ position: 'absolute', right: '0px', fontSize: '12px' }}>
                    {intl.formatMessage(messages.currentBalance, {
                      amount: props.currentBalanceAda,
                    })}
                  </Box>
                </div>
              </InputAdornment>
            ),
            sx: {
              paddingBottom: '1lh',
            },
          }}
          sx={{
            paddingBottom: 0,
          }}
          value={state.amountAda}
          onChange={this.onChangeAmount}
          error={state.error !== null}
          helperText={helperText}
          autoFocus
        />

        <ProviderRow>
          <div className="provider-logo">
            <img src={providerLogo} alt="" />
          </div>
          <div className="provider-name-fee">
            <div className="provider-name">{providerName}</div>
            <div className="provider-fee">2% fee</div>
          </div>
        </ProviderRow>


        <Disclaimer>
          <header>
            <InfoIcon style={{ verticalAlign: 'middle' }} />
            <span style={{ verticalAlign: 'middle' }}>{intl.formatMessage(messages.disclaimer)}</span>
          </header>
          {intl.formatMessage(messages.disclaimerText)}
        </Disclaimer>
      </>
    );
  }

  render(): Node {
    const { intl } = this.context;
    const { state, props } = this;

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.buyAda)}
        closeOnOverlayClick={false}
        onClose={props.onCancel}
        closeButton={<DialogCloseButton />}
        forceBottomDivider
        actions={[
          {
            label: intl.formatMessage(messages.proceed),
            primary: true,
            disabled: state.amountAda === '' || state.error !== null,
            onClick: this.onSubmit,
            isSubmitting: state.isSubmitting,
          },
        ]}
        styleOverride={{ width: '648px' }}
        styleFlags={{ contentNoTopPadding: true }}
      >
        <Tabs
          value={state.isBuying ? 0 : 1}
          onChange={() => this.setState({ isBuying: !state.isBuying })}
          sx={{
            width: '100%',
            [`& .${tabsClasses.indicator}`]: {
              display: 'none',
            },
            boxShadow: 'none',
          }}
        >
          <TabItem disableRipple label={intl.formatMessage(globalMessages.buyAda)} />
          <TabItem disableRipple label={intl.formatMessage(globalMessages.sellAda)} />
        </Tabs>

        {this.renderBuySell()}
      </Dialog>
    );
  }
}

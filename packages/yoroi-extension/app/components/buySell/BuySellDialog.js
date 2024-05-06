// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';

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
import { ReactComponent as InfoIcon } from '../../assets/images/info-icon-revamp.inline.svg';
import { banxaModuleMaker } from '@yoroi/banxa'

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
  lessThanBuyMinimum: {
    id: 'buysell.dialog.error.buy.minimum',
    defaultMessage: '!!!Minimum required is {amount} ADA',
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
    defaultMessage: '!!!Yoroi uses Banxa to provide direct Fiat-ADA exchange. By clicking “Proceed,” you also acknowledge that you will be redirected to our partner’s website, where you may be asked to accept their terms and conditions. Banxa may have buy and sell limitations depending on your location and your financial institution.'
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
  +tabBuy: boolean,
  +error: null | 'lessThanBuyMinimum',
  +buyAmountAda: string,
  +isSubmitting: boolean,
|};

const MINIMUM_BUY_ADA = new BigNumber('100');
const BANXA_CALLBACK_URL = 'https://ramp-redirect.yoroiwallet.com/yoroi-extension-banxa-callback.html';

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
  justifyContent: 'space-between',
  marginBottom: '16px',
});

const ProviderLabel = styled(Box)({
  color: 'var(--grayscale-contrast-600, #6B7384)',
  fontFeatureSettings: `'clig' off, 'liga' off`,
  fontFamily: 'Rubik',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '24px',
});

const ProviderInfo = styled(Box)({
  color: 'var(--grayscale-contrast-max, #000)',
  fontFeatureSettings: `'clig' off, 'liga' off`,
  fontFamily: 'Rubik',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '24px',
});

const Disclaimer = styled(Box)({
  color: 'var(--grayscale-contrast-900, #242838)',
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
  background: 'var(--gradient-light-green-blue, linear-gradient(340deg, #C6F7ED 10%, #E4E8F7 60%))',
  padding: 'var(--spacing-12, 12px) var(--spacing-16, 16px) var(--spacing-16, 16px) var(--spacing-16, 16px)'
});

@observer
export default class BuySellDialog extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    tabBuy: true,
    error: null,
    buyAmountAda: '',
    isSubmitting: false,
  };

  onSubmit: () => Promise<void> = async () => {
    const { state, props } = this;

    if (state.tabBuy) {
      this.setState({ isSubmitting: true });
      const banxa = banxaModuleMaker({ isProduction: true, partner: 'yoroi' });
      const url = banxa.createReferralUrl({
        fiatType: 'USD',
        coinType: 'ADA',
        walletAddress: await props.receiveAdaAddressPromise,
        orderType: 'buy',
        returnUrl: BANXA_CALLBACK_URL,
        coinAmount: Number(state.buyAmountAda),
      });

      const self = this;
      chrome.tabs.create({ url: url.href }, (exchangePageTab) => {
        chrome.tabs.onRemoved.addListener((tabId) => {
          if (tabId === exchangePageTab.id) {
            self.setState({ isSubmitting: false });
          }
        });

        chrome.runtime.onMessage.addListener((message, sender) => {
          if (message.type === 'banxa callback' && sender.tab.id === exchangePageTab.id) {
            chrome.tabs.remove(sender.tab.id);
            props.onExchangeCallback();
          }
        });
      });
    }
  }

  onChangeBuyAmount: (SyntheticInputEvent<HTMLInputElement>) => void = (event) => {
    const { value } = event.target;

    if (!value.match(/^\d*$/)) {
      return;
    }

    this.setState({
      buyAmountAda: value,
      error: (value !== '' && MINIMUM_BUY_ADA.gt(value)) ? 'lessThanBuyMinimum' : null,
    });
  }

  renderBuy(): Node {
    const { intl } = this.context;
    const { state, props } = this;

    // set a place holder so that when it becomes an error message, the height doesn't change
    let helperText = ' ';
    if (state.error === 'lessThanBuyMinimum') {
      helperText = intl.formatMessage(messages.lessThanBuyMinimum, { amount: MINIMUM_BUY_ADA.toString() });
    }

    return (
      <>
        <TextField
          label={intl.formatMessage(messages.adaAmount)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <div style={{ position: 'relative' /* so that the balance line can align on the right side */ }}>
                  <div style={{ marginBottom: '8px', color: '#000' }}>
                    <img
                      style={{ marginRight: '8px', borderRadius: '4px', verticalAlign: 'bottom' }}
                      src={adaPng}
                      alt=""
                    />ADA
                  </div>
                  <Box sx={{ position: 'absolute', right: '0px', fontSize: '12px' }}>
                    {intl.formatMessage(messages.currentBalance, { amount: props.currentBalanceAda })}
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
          value={state.buyAmountAda}
          onChange={this.onChangeBuyAmount}
          error={state.error !== null}
          helperText={helperText}
          autoFocus
        />

        <ProviderRow>
          <ProviderLabel>
            {intl.formatMessage(globalMessages.provider)}
          </ProviderLabel>
          <ProviderInfo>
            <img style={{ verticalAlign: 'bottom' }} src={banxaPng} alt="" />
            Banxa
          </ProviderInfo>
        </ProviderRow>

        <ProviderRow>
          <ProviderLabel>
            {intl.formatMessage(messages.providerFee)}
          </ProviderLabel>
          <ProviderInfo>
            2%
          </ProviderInfo>
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

  renderSell(): Node {
    return null;
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
            disabled: state.buyAmountAda === '' || state.error !== null,
            onClick: this.onSubmit,
            isSubmitting: state.isSubmitting,
          }
        ]}
        styleOverride={{ width: '648px' }}
        styleFlags={{ contentNoTopPadding: true }}
      >
        <Tabs
          value={state.tabBuy ? 0 : 1}
          onChange={() => this.setState({ tabBuy: !state.tabBuy })}
          sx={{
            width: '100%',
            [`& .${tabsClasses.indicator}`]: {
              display: 'none',
            },
            boxShadow: 'none',
            display: 'none',
          }}
        >
          <TabItem disableRipple label={intl.formatMessage(globalMessages.buyAda)} />
          <TabItem disableRipple label={intl.formatMessage(globalMessages.sellAda)} />
        </Tabs>

        {state.tabBuy ? this.renderBuy() : this.renderSell()}
      </Dialog>
    );
  }
}

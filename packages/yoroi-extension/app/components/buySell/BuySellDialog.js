// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Tab, { tabClasses } from '@mui/material/Tab';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import { Box, Typography, styled } from '@mui/material';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, IntlContext } from 'react-intl';
import { ReactComponent as YoroiIcon } from '../../assets/images/yoroi-logo-shape-blue.inline.svg';
import { ReactComponent as FailIcon } from '../../assets/images/service-unavailable-error.svg';
import { exchangeApiMaker, exchangeManagerMaker } from '@yoroi/exchange';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import globalMessages from '../../i18n/global-messages';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import BigNumber from 'bignumber.js';
import adaPng from '../../assets/images/ada.png';
import banxaPng from '../../assets/images/banxa.png';
import encryptusPng from '../../assets/images/encryptus.png';
import environment from '../../environment';
import BuySellDisclaimerDialog from './DisclaimerDialog';
import { ampli } from '../../../ampli/index';

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
  buyProviderFee: {
    id: 'buysell.dialog.buyProviderFee',
    defaultMessage: '!!!2% fee',
  },
  sellProviderFee: {
    id: 'buysell.dialog.sellProviderFee',
    defaultMessage: '!!!2.5% fee',
  },
  proceed: {
    id: 'buysell.dialog.proceed',
    defaultMessage: 'PROCEED',
  },
  urlGenerationErrorDialogTitle: {
    id: 'buysell.dialog.error.dialog.title',
    defaultMessage: '!!!url generation',
  },
  longLoadingDialogText: {
    id: 'buysell.dialog.longloading.text',
    defaultMessage: '!!!We are redirecting you outside Yoroi. Please wait.',
  },
  failDialogText: {
    id: 'buysell.dialog.fail.text',
    defaultMessage: '!!!This service is currently unavailable. Please try again later.',
  },
});

type Props = {|
  +onCancel: void => void,
  +onExchangeCallback: void => void,
  +currentBalanceAda: BigNumber,
  +receiveAdaAddress: string,
|};

type State = {|
  +isBuying: boolean,
  +showDisclaimer: boolean,
  +inputError: null | 'lessThanBuyMinimum' | 'notEnoughBalance' | 'lessThanSellMinimum',
  // 'longLoading' is not really an error but is an temporary state
  +urlGenerationError: null | 'longLoading' | 'timeout' | 'failed' | 'aborted',
  +amountAda: string,
  +isSubmitting: boolean,
|};

const MINIMUM_BUY_ADA = new BigNumber('100');
const MINIMUM_SELL_ADA = new BigNumber('1');
const EXCHANGE_CALLBACK_URL = 'https://ramp-redirect.yoroiwallet.com/yoroi-extension-exchange-callback.html';

const STabItem = styled(Tab)(({ theme }) => ({
  position: 'relative',
  borderRadius: '8px',
  textAlign: 'center',
  transition: 'all .5s',
  [`&.${tabClasses.root}`]: {
    color: theme.palette.ds.text_gray_max,
    padding: '8px',
    backgroundColor: 'transparent',
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '24px',
  },
  height: 'auto',
  margin: '10px 0',
  float: 'none',
  [`&.${tabClasses.selected}, &.${tabClasses.root}:hover`]: {
    backgroundColor: theme.palette.ds.gray_200,
    color: theme.palette.ds.text_gray_max,
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '24px',
  },
}));

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

const ErrorPopoutContent = styled(Box)({
  height: '428px',
  width: '343px',
  // horizontally center the icon and text {
  display: 'flex',
  margin: 'auto',
  '& .content': {
    margin: 'auto',
  },
  // }
  '& svg': {
    // vertically center {
    display: 'block',
    margin: '0 auto',
    // }
    width: '137px',
  },
  '& .text': {
    marginTop: '24px',
    fontFamily: 'Rubik',
    fontSize: '20px',
    fontWeight: 500,
    lineHeight: '30px',
    textAlign: 'center',
  },
});

const URL_GENERATION_LONG_LOADING_TIMEOUT = 2 * 1000;
const URL_GENERATION_TIMEOUT = 30 * 1000;

const dialogTitle = environment.isDev() || environment.isNightly() ? messages.dialogTitle : globalMessages.buyAda;

@observer
export default class BuySellDialog extends Component<Props, State> {
  static contextType = IntlContext;
  state: State = {
    isBuying: true,
    inputError: null,
    urlGenerationError: null,
    amountAda: '',
    isSubmitting: false,
    showDisclaimer: true
  };

  urlGenerationTimeout: null | TimeoutID = null;

  componentDidMount() {
    ampli.exchangePageViewed();
  }

  onSubmit: () => Promise < void> = async () => {
    const { state, props } = this;

    this.setState({ isSubmitting: true, urlGenerationError: null });
    const api = exchangeApiMaker({ isProduction: true, partner: 'yoroi' });
    const manager = exchangeManagerMaker({ api });

    let params;
    if (state.isBuying) {
      params = {
        providerId: 'banxa',
        queries: {
          fiatType: 'USD',
          coinType: 'ADA',
          walletAddress: props.receiveAdaAddress,
          orderType: 'buy',
          returnUrl: EXCHANGE_CALLBACK_URL,
          coinAmount: Number(state.amountAda),
          balance: props.currentBalanceAda.toString(),
        },
      };
    } else {
      params = {
        providerId: 'encryptus',
        queries: {
          fiatType: 'USD',
          coinType: 'ADA',
          walletAddress: props.receiveAdaAddress,
          orderType: 'sell',
          returnUrl: EXCHANGE_CALLBACK_URL,
          coinAmount: Number(state.amountAda),
          balance: props.currentBalanceAda.toString(),
        },
      };
    }

    this.urlGenerationTimeout = setTimeout(() => {
      // may already have failed
      if (this.state.urlGenerationError) {
        return;
      }
      this.setState({ urlGenerationError: 'longLoading' });
      this.urlGenerationTimeout = setTimeout(() => {
        if (this.state.urlGenerationError) {
          return;
        }
        this.setState({ urlGenerationError: 'timeout' });
      }, URL_GENERATION_TIMEOUT - URL_GENERATION_LONG_LOADING_TIMEOUT);
    }, URL_GENERATION_LONG_LOADING_TIMEOUT);

    let url;
    try {
      url = await manager.referralLink.create(params);
    } catch (_error) {
      this.setState({ urlGenerationError: 'failed' });
      return;
    } finally {
      clearTimeout(this.urlGenerationTimeout);
    }

    // if timeout already happened or user aborted, give up on the process
    const { urlGenerationError } = this.state;
    if (urlGenerationError === 'timeout' || urlGenerationError === 'aborted') {
      return;
    }
    // may be in `longLoading` now
    this.setState({ urlGenerationError: null });

    const self = this;
    chrome.tabs.create({ url: url.href }, exchangePageTab => {
      chrome.tabs.onRemoved.addListener(tabId => {
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
    ampli.exchangeSubmitted({
      ada_amount: Number(state.amountAda),
      ramp_type: state.isBuying ? 'Buy' : 'Sell',
    });
  };

  onChangeAmount: (SyntheticInputEvent < HTMLInputElement >) => void = event => {
    const { value } = event.target;

    if (!value.match(/^\d*$/)) {
      return;
    }

    const inputError = (() => {
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

    this.setState({ amountAda: value, inputError });
  };

  setDisclaimerAccepted: () => void = () => {
    this.setState({ showDisclaimer: false });
  }

  renderDisclaimerDialog: () => Node = () => {
    const intl = this.context;
    const { onCancel } = this.props;
    return (
      <BuySellDisclaimerDialog onAccept={this.setDisclaimerAccepted} onClose={onCancel} intl={intl} />
    )
  }

  renderBuySell(): Node {
    const intl = this.context;
    const { state, props } = this;

    const [providerLogo, providerName] = state.isBuying ? [banxaPng, 'Banxa'] : [encryptusPng, 'Encryptus'];

    // set a place holder so that when it becomes an error message, the height doesn't change
    let helperText = ' ';
    if (state.inputError === 'lessThanBuyMinimum') {
      helperText = intl.formatMessage(messages.lessThanMinimum, { amount: MINIMUM_BUY_ADA.toString() });
    } else if (state.inputError === 'lessThanSellMinimum') {
      helperText = intl.formatMessage(messages.lessThanMinimum, { amount: MINIMUM_SELL_ADA.toString() });
    } else if (state.inputError === 'notEnoughBalance') {
      helperText = intl.formatMessage(messages.notEnoughBalance);
    }

    return (
      <>
        <TextField
          label={intl.formatMessage(messages.adaAmount)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <div style={{ position: 'relative' /* so that the balance line can align on the right side */ }}>
                  <div style={{ marginBottom: '8px', color: '#000', display: 'flex', alignItems: 'center' }}>
                    <img style={{ marginRight: '8px', borderRadius: '4px', verticalAlign: 'bottom' }} src={adaPng} alt="" />
                    <Typography variant="body2" color="ds.text_gray_max">
                      ADA
                    </Typography>
                  </div>
                  <Box color="ds.text_gray_low" sx={{ position: 'absolute', right: '0px', fontSize: '12px' }}>
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
          value={state.amountAda}
          onChange={this.onChangeAmount}
          error={state.inputError !== null}
          helperText={helperText}
          autoFocus
        />

        <ProviderRow>
          <div className="provider-logo">
            <img src={providerLogo} alt="" />
          </div>
          <div className="provider-name-fee">
            <Typography variant="body2" color="ds.text_gray_medium" className="provider-name">
              {providerName}
            </Typography>
            <Typography variant="body2" color="ds.text_gray_medium" className="provider-fee">
              {state.isBuying ? intl.formatMessage(messages.buyProviderFee) : intl.formatMessage(messages.sellProviderFee)}
            </Typography>
          </div>
        </ProviderRow>
      </>
    );
  }

  render(): Node {
    const intl = this.context;
    const { state, props } = this;
    const { urlGenerationError, showDisclaimer } = state;

    if (showDisclaimer) {
      return this.renderDisclaimerDialog();
    }

    if (urlGenerationError === 'longLoading') {
      const abortUrlGeneration = () => {
        this.setState({ urlGenerationError: 'aborted', isSubmitting: false });
      };
      return (
        <Dialog
          title={intl.formatMessage(messages.urlGenerationErrorDialogTitle)}
          closeOnOverlayClick={false}
          closeButton={<DialogCloseButton />}
          onClose={abortUrlGeneration}
        >
          <ErrorPopoutContent>
            <div className="content">
              <YoroiIcon />
              <Typography variant="h1" color="ds.text_gray_medium" className="text">
                {intl.formatMessage(messages.failDialogText)}
              </Typography>
            </div>
          </ErrorPopoutContent>
        </Dialog>
      );
    }

    if (urlGenerationError === 'timeout' || urlGenerationError === 'failed') {
      const dismissUrlGenerationError = () => {
        this.setState({ urlGenerationError: null, isSubmitting: false });
      };

      return (
        <Dialog
          title={intl.formatMessage(messages.urlGenerationErrorDialogTitle)}
          closeOnOverlayClick
          closeButton={<DialogCloseButton />}
          onClose={dismissUrlGenerationError}
        >
          <ErrorPopoutContent>
            <div className="content">
              <FailIcon />
              <div className="text">{intl.formatMessage(messages.failDialogText)}</div>
            </div>
          </ErrorPopoutContent>
        </Dialog>
      );
    }

    return (
      <Dialog
        title={intl.formatMessage(dialogTitle)}
        closeOnOverlayClick={false}
        onClose={props.onCancel}
        closeButton={<DialogCloseButton />}
        dialogActions={[
          {
            label: intl.formatMessage(globalMessages.proceed),
            primary: true,
            disabled: state.amountAda === '' || state.inputError !== null,
            onClick: this.onSubmit,
            isSubmitting: state.isSubmitting,
          },
        ]}
        styleOverride={{ width: '648px' }}
        styleFlags={{ contentNoTopPadding: true }}
      >
        {(environment.isDev() || environment.isNightly()) && (
          <Tabs
            value={state.isBuying ? 0 : 1}
            onChange={() => this.setState({ isBuying: !state.isBuying, inputError: null })}
            sx={{
              width: '100%',
              [`& .${tabsClasses.indicator}`]: {
                display: 'none',
              },
              boxShadow: 'none',
            }}
          >
            <STabItem disableRipple label={intl.formatMessage(globalMessages.buyAda)} />
            <STabItem disableRipple label={intl.formatMessage(globalMessages.sellAda)} />
          </Tabs>
        )}
        {this.renderBuySell()}
      </Dialog>
    );
  }
}

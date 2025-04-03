// @flow
import type { Node } from 'react';
/* eslint-disable no-nested-ternary */
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import classNames from 'classnames';
import styles from './ConnectPage.scss';
import { Button, Stack, styled, Typography } from '@mui/material';
import ConnectedWallet from './ConnectedWallet';
import globalMessages, { connectorMessages } from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import type { ConnectingMessage } from '../../../../chrome/extension/connector/types';
import { LoadingWalletStates } from '../../types';
import ProgressBar from '../ProgressBar';
import { environment } from '../../../environment';
import { Box } from '@mui/system';
import TextField from '../../../components/common/TextField';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { ReactComponent as NoWalletImage } from '../../assets/images/no-websites-connected.inline.svg';
import { ReactComponent as NoDappIcon } from '../../../assets/images/dapp-connector/no-dapp.inline.svg';
import { ReactComponent as IconEyeOpen } from '../../../assets/images/my-wallets/icon_eye_open.inline.svg';
import { ReactComponent as IconEyeClosed } from '../../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import AmountDisplay from '../../../components/common/AmountDisplay';
import type { WalletState } from '../../../../chrome/extension/background/types';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks.js';
import { ReactComponent as ExclamationIcon } from '../../../assets/images/testnet-exclamation-circle.svg';
import { NETWORK_BADGES } from '../../../containers/NavBarContainerRevamp';

const messages = defineMessages({
  subtitle: {
    id: 'connector.label.connect',
    defaultMessage: '!!!Connect to',
  },
  connectWallet: {
    id: 'connector.label.connectWallet',
    defaultMessage: '!!!Connect Wallet',
  },
  connectWalletAuthRequest: {
    id: 'connector.label.connectWalletAuthRequest',
    defaultMessage: '!!!The dApp requests to use your wallet identity for authentication. Enter your password to confirm.',
  },
  yourWallets: {
    id: 'connector.label.yourWallets',
    defaultMessage: '!!!Your Wallets',
  },
  selectAllWallets: {
    id: 'connector.label.selectAllWallets',
    defaultMessage: '!!!Select all wallets',
  },
  connectInfo: {
    id: 'connector.connect.info',
    defaultMessage: '!!!Your connection preferences will be saved to your Yoroi dApp list.',
  },
  noWalletsFound: {
    id: 'connector.connect.noWalletsFound',
    defaultMessage: '!!!Ooops, no {network} wallets found',
  },
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
  },
  createWallet: {
    id: 'connector.connect.createWallet',
    defaultMessage: '!!!create wallet',
  },
  harwareWalletConnectWithAuthNotSupported: {
    id: 'connector.connect.hardwareWalletsConnectWithAuthNotSupported',
    defaultMessage: '!!!Connecting to hardware wallet with authentication is not supported',
  },
  testnetWarningTitle: {
    id: 'connector.connect.testnetWarningTitle',
    defaultMessage: '!!!Testnet support',
  },
  testnetWarningText: {
    id: 'connector.connect.testnetWarningText',
    defaultMessage: '!!!This DApp may not support Cardano {networkName} (test blockchain network). Ensure it supports {networkName} before connecting.',
  },
  cashbackApplyAll: {
    id: 'connector.connect.cashback.apply.all',
    defaultMessage: '!!!The wallet you select will be applied for all partner websites.'
  },
  cashbackDisabledTrezor: {
    id: 'connector.connect.cashback.trezor.disabled',
    defaultMessage: '!!!Cashback service doesn’t support Trezor wallet connection',
  },
  addWallet: {
    id: 'connector.connect.cashback.addWallet',
    defaultMessage: '!!!Add wallet',
  },
});

type Props = {|
  +publicDerivers: Array<WalletState>,
  +loading: $Values<typeof LoadingWalletStates>,
  +error: string,
  +isAppAuth: boolean,
  +hidePasswordForm: void => void,
  +onConnect: (deriver: WalletState, checksum: ?WalletChecksum, password: ?string) => Promise<void>,
  +onCancel: void => void,
  +selectedWallet: {|
    index: number,
    deriver: ?WalletState,
    checksum: ?WalletChecksum,
  |},
  +message: ?ConnectingMessage,
  +onSelectWallet: (WalletState, ?WalletChecksum) => void,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +networkId: number,
  +shouldHideBalance: boolean,
  +unitOfAccount: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +onUpdateHideBalance: void => Promise<void>,
  +isSelectingCashbackWallet?: boolean,
|};

@observer
export default class ConnectPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
          placeholder: this.context.intl.formatMessage(globalMessages.walletPasswordFieldPlaceholder),
          value: '',
          validators: [
            ({ field }) => {
              if (field.value === '') {
                return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              return [true];
            },
          ],
        },
      },
    },
    {
      options: {
        validateOnChange: true,
        validateOnBlur: false,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  hidePasswordForm: void => void = () => {
    this.form.$('walletPassword').clear();
    this.props.hidePasswordForm();
  };

  submit: void => void = () => {
    this.form.submit({
      onSuccess: form => {
        const { walletPassword } = form.values();
        const { deriver, checksum } = this.props.selectedWallet;
        if (deriver && checksum) {
          this.props.onConnect(deriver, checksum, walletPassword).catch(error => {
            if (error instanceof WrongPassphraseError) {
              this.form.$('walletPassword').invalidate(this.context.intl.formatMessage(messages.incorrectWalletPasswordError));
            } else {
              throw error;
            }
          });
        }
      },
      onError: () => {},
    });
  };

  onCancel: void => void = () => {
    this.props.onCancel();
  };

  onCreateWallet: void => void = () => {
    const { isSelectingCashbackWallet = false } = this.props;
    const urlHash = isSelectingCashbackWallet ? '?from=cashback' : '';
    window.chrome.tabs.create({
      url: `${window.location.origin}/main_window.html#/wallets/add${urlHash}`,
    });

    this.props.onCancel();
  };

  render(): Node {
    const { intl } = this.context;
    const {
      loading,
      error,
      publicDerivers,
      message,
      onSelectWallet,
      networkId,
      shouldHideBalance,
      isAppAuth,
      onUpdateHideBalance,
      selectedWallet,
      isSelectingCashbackWallet = false,
    } = this.props;

    const isNightly = environment.isNightly();
    const componentClasses = classNames([styles.component, isNightly && styles.isNightly]);

    const isLoading = loading === LoadingWalletStates.IDLE || loading === LoadingWalletStates.PENDING;
    const isSuccess = loading === LoadingWalletStates.SUCCESS;
    const isError = loading === LoadingWalletStates.REJECTED;
    const isSelectWalletHardware = selectedWallet.deriver?.type !== 'mnemonic';

    const url = message?.url ?? '';
    const faviconUrl = message?.imgBase64Url;

    if (isSuccess && !publicDerivers.length) {
      return (
        <div className={styles.noWallets}>
          <div className={styles.noWalletsImage}>
            <NoWalletImage />
          </div>
          <div>
            <div className={styles.noWalletsText}>{intl.formatMessage(messages.noWalletsFound, { networkId })}</div>
            <button className={styles.createWallet} onClick={this.onCreateWallet} type="button">
              {intl.formatMessage(messages.createWallet)}
            </button>
          </div>
        </div>
      );
    }

    const walletPasswordField = this.form.$('walletPassword');
    const hasWallets = isSuccess && Boolean(publicDerivers.length);

    const passwordForm = (
      <Box p="26px">
        <div>
          {isSelectWalletHardware ? (
            intl.formatMessage(messages.harwareWalletConnectWithAuthNotSupported)
          ) : (
            <TextField type="password" {...walletPasswordField.bind()} error={walletPasswordField.error} id="walletPassword" />
          )}
        </div>
        <Stack direction="row" spacing={4} mt="15px">
          <Button
            fullWidth
            variant="outlined"
            onClick={this.hidePasswordForm}
            sx={{ minWidth: 'auto' }}
            id="backButton"
          >
            {intl.formatMessage(globalMessages.backButtonLabel)}
          </Button>
          {!isSelectWalletHardware && (
            <Button
              variant="contained"
              sx={{ minWidth: 'auto' }}
              fullWidth
              disabled={!walletPasswordField.isValid}
              onClick={this.submit}
              id="confirmButton"
            >
              {intl.formatMessage(globalMessages.confirm)}
            </Button>
          )}
        </Stack>
      </Box>
    );

    const networkName = NETWORK_BADGES[networkId]?.text;

    return (
      <div className={componentClasses}>
        {hasWallets ? (
          <>
            {!isSelectingCashbackWallet && (<ProgressBar step={isAppAuth ? 2 : 1} max={2} />)}
            <Typography
              component="div"
              variant="h4"
              color="gray.900"
              marginTop="32px"
              paddingX="32px"
              fontWeight="500"
              textAlign="center"
              fontSize="20px"
              className={styles.pageTitle}
            >
              {intl.formatMessage(messages.connectWallet)}
            </Typography>
            {!isSelectingCashbackWallet && (
              <div className={styles.connectWrapper}>
                <div className={styles.image}>
                  {faviconUrl != null && faviconUrl !== '' ? <img src={faviconUrl} alt={`${url} favicon`} /> : <NoDappIcon />}
                </div>
                <Box marginTop="16px">
                  <Typography component="div" variant="body-1" fontWeight="400" color="gray.900">
                    {intl.formatMessage(messages.subtitle)}{' '}
                    <Typography as="span" variant="body-1" fontWeight="500">
                      {url}
                    </Typography>
                  </Typography>
                </Box>
              </div>
            )}
          </>
        ) : null}
        <Box flex={1}>
          {isAppAuth ? (
            passwordForm
          ) : (
            <>
              {isError ? <div className={styles.errorMessage}>{error}</div> : null}
              {isLoading ? (
                <div className={styles.loading}>
                  <LoadingSpinner />
                </div>
              ) : hasWallets ? (
                <div className={styles.walletsContainer}>
                  <div className={styles.titleWallet}>
                    <Typography component="div" variant="body-1" lineHeight="24px" color="gray.900">
                      {intl.formatMessage(messages.yourWallets)}
                    </Typography>
                    <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
                      {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
                    </button>
                  </div>

                  {(networkId !== networks.CardanoMainnet.NetworkId) && (
                    <TestnetWarningBox>
                      <TestnetWarningTitle>
                        <ExclamationIcon />
                        {intl.formatMessage(messages.testnetWarningTitle)}
                      </TestnetWarningTitle>
                      <Typography>
                        {intl.formatMessage(messages.testnetWarningText, { networkName })}
                      </Typography>
                    </TestnetWarningBox>
                  )}

                  {isSelectingCashbackWallet && (
                    <div className={styles.cashbackApplyAll}>{intl.formatMessage(messages.cashbackApplyAll)}</div>
                  )}

                  <ul className={styles.list}>
                    {publicDerivers.map((wallet, idx) => {
                      const isTrezor = isSelectingCashbackWallet && wallet.type === 'trezor';
                      const Btn = isTrezor ? DisabledWalletButton : WalletButton;
                      return (
                        <li
                          key={wallet.publicDeriverId}
                          className={[styles.listItem, isTrezor ? '' : styles.enabledWallet].join(' ')}
                        >
                          <Btn onClick={() => onSelectWallet(wallet, wallet.plate)}>
                            <ConnectedWallet
                              disabledForReason={
                                isTrezor ? intl.formatMessage(messages.cashbackDisabledTrezor) : null
                              }
                              publicDeriver={wallet}
                              walletBalance={
                                <Box
                                  sx={{
                                    ml: 'auto',
                                    textAlign: 'right',
                                  }}
                                >
                                  <AmountDisplay
                                    shouldHideBalance={this.props.shouldHideBalance}
                                    amount={wallet.balance}
                                    getTokenInfo={this.props.getTokenInfo}
                                    unitOfAccountSetting={this.props.unitOfAccount}
                                    getCurrentPrice={this.props.getCurrentPrice}
                                    showFiat
                                    showAmount
                                    id={'dAppConnector:connect:walletList:walletCard_' + idx}
                                  />
                                </Box>
                              }
                            />
                          </Btn>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </Box>
        {!isSelectingCashbackWallet && hasWallets && !isAppAuth ? (
          <div className={styles.bottom}>
            <div className={styles.infoText}>{intl.formatMessage(messages.connectInfo)}</div>
            <div className={styles.infoText}>{intl.formatMessage(connectorMessages.messageReadOnly)}</div>
          </div>
        ) : null}
        {isSelectingCashbackWallet && (
          <Box sx={{ display: 'flex', gap: '15px', padding: '32px' }}>
            <Button
              sx={{ minWidth: 0 }}
              fullWidth
              variant="outlined"
              color="primary"
              onClick={this.onCancel}
              id="cancelButton"
            >
              {intl.formatMessage(globalMessages.cancel)}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => {
                this.onCreateWallet();
              }}
              sx={{ minWidth: 0 }}
              id="addWalletButton"
            >
              {intl.formatMessage(messages.addWallet)}
            </Button>
          </Box>
        )}
      </div>
    );
  }
}

const WalletButton = styled('button')({
  cursor: 'pointer',
  width: '100%',
  fontSize: '1rem',
  padding: '16px',
});
const DisabledWalletButton = styled(WalletButton)({
  cursor: 'default',
});

const TestnetWarningBox = styled(Box)(({ theme }) => ({
  background: theme.palette.ds.sys_yellow_100,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}));

const TestnetWarningTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.ds.sys_orange_500,
  fontWeight: 500,
  '& svg': {
    verticalAlign: 'text-bottom',
    marginRight: '8px',
  },
}));

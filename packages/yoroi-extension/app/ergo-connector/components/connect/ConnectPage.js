/* eslint-disable no-nested-ternary */
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classNames from 'classnames';
import styles from './ConnectPage.scss';
import { Button, Stack, styled, Typography } from '@mui/material';
import WalletCard from './WalletCard';
import globalMessages, { connectorMessages } from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import type {
  PublicDeriverCache,
  ConnectingMessage,
} from '../../../../chrome/extension/ergo-connector/types';
import { LoadingWalletStates } from '../../types';
import ProgressBar from '../ProgressBar';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { environment } from '../../../environment';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { Box } from '@mui/system';
import TextField from '../../../components/common/TextField';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors'
import { ReactComponent as NoWalletImage }  from '../../assets/images/no-websites-connected.inline.svg'
import { ReactComponent as NoDappIcon }  from '../../../assets/images/dapp-connector/no-dapp.inline.svg';

const messages = defineMessages({
  subtitle: {
    id: 'ergo-connector.label.connect',
    defaultMessage: '!!!Connect to',
  },
  connectWallet: {
    id: 'ergo-connector.label.connectWallet',
    defaultMessage: '!!!Connect Wallet',
  },
  connectWalletAuthRequest: {
    id: 'ergo-connector.label.connectWalletAuthRequest',
    defaultMessage: '!!!The dApp requests to use your wallet identity for authentication. Enter your spending password to confirm.',
  },
  connectWalletNoHardwareSupported: {
    id: 'ergo-connector.label.connectWalletNoHardwareSupported',
    defaultMessage: '!!!Note, hardware wallets are not supported for the dapp connecting yet.',
  },
  yourWallets: {
    id: 'ergo-connector.label.yourWallets',
    defaultMessage: '!!!Your Wallets',
  },
  selectAllWallets: {
    id: 'ergo-connector.label.selectAllWallets',
    defaultMessage: '!!!Select all wallets',
  },
  connectInfo: {
    id: 'ergo-connector.connect.info',
    defaultMessage: '!!!Your connection preferences will be saved to your Yoroi dApp list.',
  },
  noWalletsFound: {
    id: 'ergo-connector.connect.noWalletsFound',
    defaultMessage: '!!!Ooops, no {network} wallets found',
  },
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
  },
  createWallet: {
    id: 'ergo-connector.connect.createWallet',
    defaultMessage: '!!!create wallet',
  },
});

type Props = {|
  +publicDerivers: Array<PublicDeriverCache>,
  +loading: $Values<typeof LoadingWalletStates>,
  +error: string,
  +isAppAuth: boolean,
  +hidePasswordForm: void => void,
  +onConnect: (
    deriver: PublicDeriver<>,
    checksum: ?WalletChecksum,
    password: ?string
  ) => Promise<void>,
  +onCancel: void => void,
  +selectedWallet: {|
    index: number,
    deriver: ?PublicDeriver<>,
    checksum: ?WalletChecksum,
  |},
  +message: ?ConnectingMessage,
  +onSelectWallet: (PublicDeriver<>, ?WalletChecksum) => void,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +network: string,
  +shouldHideBalance: boolean,
|};

@observer
class ConnectPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
          placeholder: this.context.intl.formatMessage(
            globalMessages.walletPasswordFieldPlaceholder
          ),
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
    this.form.$('walletPassword').clear()
    this.props.hidePasswordForm()
  }

  submit: void => void = () => {
    this.form.submit({
      onSuccess: form => {
        const { walletPassword } = form.values();
        const { deriver, checksum } = this.props.selectedWallet;
        if (deriver && checksum) {
          this.props.onConnect(deriver, checksum, walletPassword).catch(error => {
            if (error instanceof WrongPassphraseError) {
              this.form.$('walletPassword').invalidate(
                this.context.intl.formatMessage(messages.incorrectWalletPasswordError)
              )
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
    window.chrome.tabs.create({
      url: `${window.location.origin}/main_window.html#/wallets/add`
    })

    this.props.onCancel()
  }

  render(): Node {
    const { intl } = this.context;
    const {
      loading,
      error,
      publicDerivers,
      message,
      onSelectWallet,
      network,
      shouldHideBalance,
      isAppAuth,
    } = this.props;
    const isNightly = environment.isNightly();
    const componentClasses = classNames([styles.component, isNightly && styles.isNightly]);

    const isLoading =
      loading === LoadingWalletStates.IDLE || loading === LoadingWalletStates.PENDING;
    const isSuccess = loading === LoadingWalletStates.SUCCESS;
    const isError = loading === LoadingWalletStates.REJECTED;

    const url = message?.url ?? '';
    const faviconUrl = message?.imgBase64Url;

    if (isSuccess && !publicDerivers.length) {
      return (
        <div className={styles.noWallets}>
          <div className={styles.noWalletsImage}>
            <NoWalletImage />
          </div>
          <div>
            <p className={styles.noWalletsText}>
              {intl.formatMessage(messages.noWalletsFound, { network })}
            </p>
            <button className={styles.createWallet} onClick={this.onCreateWallet} type="button">
              {intl.formatMessage(messages.createWallet)}
            </button>
          </div>
        </div>
      )
    }

    const walletPasswordField = this.form.$('walletPassword');

    const hasWallets = isSuccess && Boolean(publicDerivers.length);

    const passwordForm = (
      <>
        <div>
          <Typography
            variant="h4"
            align='center'
            color="var(--yoroi-palette-gray-900)"
            marginBottom="40px"
            paddingLeft="32px"
            fontWeight="400"
          >
            {intl.formatMessage(messages.connectWalletAuthRequest)}
          </Typography>
          <TextField
            type="password"
            {...walletPasswordField.bind()}
            error={walletPasswordField.error}
          />
        </div>
        <Stack direction="row" spacing={2} mt="15px">
          <Button fullWidth variant="secondary" onClick={this.hidePasswordForm} sx={{ minWidth: 'auto' }}>
            {intl.formatMessage(globalMessages.backButtonLabel)}
          </Button>
          <Button
            variant="primary"
            sx={{ minWidth: 'auto' }}
            fullWidth
            disabled={!walletPasswordField.isValid}
            onClick={this.submit}
          >
            {intl.formatMessage(globalMessages.confirm)}
          </Button>
        </Stack>
      </>
    );

    return (
      <div className={componentClasses}>
        {hasWallets ? (
          <>
            <ProgressBar step={1} />
            <Typography
              variant="h3"
              color="var(--yoroi-palette-gray-900)"
              marginTop="20px"
              paddingLeft="32px"
              fontWeight="400"
              className={styles.pageTitle}
            >
              {intl.formatMessage(messages.connectWallet)}
            </Typography>
            <div className={styles.connectWrapper}>
              <div className={styles.image}>
                {faviconUrl != null && faviconUrl !== '' ? <img src={faviconUrl} alt={`${url} favicon`} />: <NoDappIcon />}
              </div>
              <Box marginTop="16px">
                <Typography variant="h5" fontWeight="300" color="var(--yoroi-palette-gray-900)">
                  {intl.formatMessage(messages.subtitle)}{' '}
                  <Typography as="span" variant="h5" fontWeight="500">
                    {url}
                  </Typography>
                </Typography>
              </Box>
            </div>
          </>
        ) : null}
        <Box flex={1} padding="0 32px 17px">
          {isAppAuth ? (
            passwordForm
          ) : (
            <>
              <Box borderBottom="1px solid #dce0e9">
                {isError ? <div className={styles.errorMessage}>{error}</div> : null}
                {isLoading ? (
                  <div className={styles.loading}>
                    <LoadingSpinner />
                  </div>
                ) : hasWallets ? (
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="300"
                      color="var(--yoroi-palette-gray-600)"
                      mb="14px"
                    >
                      {intl.formatMessage(messages.yourWallets)}
                    </Typography>
                    <ul className={styles.list}>
                      {publicDerivers.map(item => (
                        <li
                          key={item.publicDeriver.getPublicDeriverId()}
                          className={styles.listItem}
                        >
                          <WalletButton
                            onClick={() => onSelectWallet(item.publicDeriver, item.checksum)}
                          >
                            <WalletCard
                              shouldHideBalance={shouldHideBalance}
                              publicDeriver={item}
                              getTokenInfo={this.props.getTokenInfo}
                            />
                          </WalletButton>
                        </li>
                      ))}
                    </ul>
                  </Box>
                ) : null}
              </Box>
              <Typography
                align='left'
                color="var(--yoroi-palette-gray-600)"
                marginTop="20px"
              >
                {intl.formatMessage(messages.connectWalletNoHardwareSupported)}
              </Typography>
            </>
          )}
        </Box>

        {hasWallets && isAppAuth ? (
          <div className={styles.bottom}>
            <div className={styles.infoText}>
              <p>{intl.formatMessage(messages.connectInfo)}</p>
              <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default ConnectPage;

const WalletButton = styled('button')({
  cursor: 'pointer',
  width: '100%',
  fontSize: '1rem',
  paddingTop: 5,
  paddingBottom: 5,
});

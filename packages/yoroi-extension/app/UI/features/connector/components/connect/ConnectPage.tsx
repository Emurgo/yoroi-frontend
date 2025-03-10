import React, { useCallback, useState } from 'react';
import { Button, Stack, Typography, Box, TextField, styled } from '@mui/material';
import { observer } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import { ConnectPageProps, LoadingWalletStates } from '../../types/connect';
import { ConnectedWallet } from './ConnectedWallet';
import { WrongPassphraseError } from '../../../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { NoWebsitesIlustration } from '../../../../components/ilustrations/NoWebsites';
import { ReactComponent as IconEyeOpen } from '../../../../../assets/images/my-wallets/icon_eye_open.inline.svg';
import { ReactComponent as IconEyeClosed } from '../../../../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import { environment } from '../../../../../environment';
import { ProgressBar } from '../ProgressBar';
// import { LoadingSpinner } from '../../../../../components/widgets/LoadingSpinner';

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  '&.isNightly': {
    backgroundColor: '#1c1d21',
  },
}));

const NoWalletsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  gap: '20px',
});

const CreateWalletButton = styled(Button)({
  marginTop: '16px',
});

export const ConnectPage: React.FC<ConnectPageProps> = observer(
  ({
    loading,
    publicDerivers,
    message,
    onSelectWallet,
    network,
    shouldHideBalance,
    onUpdateHideBalance,
    selectedWallet,
    onConnect,
    onCancel,
    hidePasswordForm,
  }) => {
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const isNightly = environment.isNightly();
    const isLoading = loading === LoadingWalletStates.IDLE || loading === LoadingWalletStates.PENDING;
    const isSuccess = loading === LoadingWalletStates.SUCCESS;
    const isSelectWalletHardware = selectedWallet.deriver?.type !== 'mnemonic';

    const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
      setPasswordError('');
    }, []);

    const handleSubmit = useCallback(async () => {
      const { deriver, checksum } = selectedWallet;
      if (deriver && checksum) {
        try {
          await onConnect(deriver, checksum, password);
        } catch (error) {
          if (error instanceof WrongPassphraseError) {
            setPasswordError('api.errors.IncorrectPasswordError');
          } else {
            throw error;
          }
        }
      }
    }, [selectedWallet, password, onConnect]);

    const handleCreateWallet = useCallback(() => {
      window.chrome.tabs.create({
        url: `${window.location.origin}/main_window.html#/wallets/add`,
      });
      onCancel();
    }, [onCancel]);

    if (isLoading) {
      return <Container className={isNightly ? 'isNightly' : ''}>{/* <LoadingSpinner /> */}</Container>;
    }

    if (isSuccess && !publicDerivers.length) {
      return (
        <NoWalletsContainer>
          <NoWebsitesIlustration />
          <Typography>
            <FormattedMessage id="connector.connect.noWalletsFound" values={{ network }} />
          </Typography>
          <CreateWalletButton variant="contained" onClick={handleCreateWallet}>
            <FormattedMessage id="connector.connect.createWallet" />
          </CreateWalletButton>
        </NoWalletsContainer>
      );
    }

    return (
      <Container className={isNightly ? 'isNightly' : ''}>
        <ProgressBar step={1} max={3} />

        {message?.url && (
          <Box p={3}>
            <Typography variant="h6">
              <FormattedMessage id="connector.label.connect" />
            </Typography>
            <Typography>{message.url}</Typography>
          </Box>
        )}

        {selectedWallet.deriver ? (
          <Box p={3}>
            <Typography>
              <FormattedMessage id="connector.label.connectWalletAuthRequest" />
            </Typography>

            {!isSelectWalletHardware && (
              <TextField
                type="password"
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError && <FormattedMessage id={passwordError} />}
                fullWidth
                margin="normal"
                label={<FormattedMessage id="global.walletPasswordLabel" />}
                placeholder="Enter wallet password"
              />
            )}

            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="outlined" fullWidth onClick={hidePasswordForm}>
                <FormattedMessage id="global.backButtonLabel" />
              </Button>
              {!isSelectWalletHardware && (
                <Button variant="contained" fullWidth disabled={!password} onClick={handleSubmit}>
                  <FormattedMessage id="global.confirm" />
                </Button>
              )}
            </Stack>
          </Box>
        ) : (
          <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                <FormattedMessage id="connector.label.yourWallets" />
              </Typography>
              <Button
                variant="text"
                onClick={onUpdateHideBalance}
                startIcon={shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
              >
                <FormattedMessage id={shouldHideBalance ? 'global.showBalance' : 'global.hideBalance'} />
              </Button>
            </Stack>

            {publicDerivers.map(wallet => (
              <Box key={wallet.id} mb={2}>
                <ConnectedWallet
                  publicDeriver={wallet}
                  walletBalance={shouldHideBalance ? null : wallet.balance}
                  onClick={() => onSelectWallet(wallet, wallet.plate?.TextPart || null)}
                />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    );
  }
);

export default ConnectPage;

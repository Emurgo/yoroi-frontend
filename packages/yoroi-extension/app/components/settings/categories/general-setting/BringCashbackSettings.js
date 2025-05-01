// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import Select from '../../../common/Select';
import { MenuItem, Typography, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { defineMessages, IntlContext, FormattedMessage } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './UnitOfAccountSettings.scss';
import Dialog from '../../../widgets/Dialog';
import VerticalFlexContainer from '../../../layout/VerticalFlexContainer';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import WalletAccountIcon from '../../../topbar/WalletAccountIcon';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { RevampSwitch } from '../../../widgets/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const messages = defineMessages({
  bringCashbackTitle: {
    id: 'settings.cashback.title',
    defaultMessage: '!!!Cashback rewards wallet',
  },
  note: {
    id: 'settings.cashback.note',
    defaultMessage:
      '!!!Your connected wallet is the designated wallet for receiving ADA cashback rewards and applied to all partner websites. You can switch to a different wallet anytime to ensure your cashback is directed to your preferred wallet or select “None” to decline this service.',
  },
  label: {
    id: 'settings.cashback.label',
    defaultMessage: '!!!Connected Wallet',
  },
});

type Props = {|
  +onSelect: number => Promise<void>,
  +isSubmitting: boolean,
  +cardanoWallets: Array<{ publicDeriverId: number, name: string, plate: WalletChecksum, isTestnet: boolean, ... }>,
  +currentValue: ?number,
  +error?: ?LocalizableError,
  +isUseSandbox: ?boolean,
  +onSetUseSandbox: null | (boolean) => *,
|};

@observer
class BringCashbackSettings extends Component<Props> {
  static defaultProps = {
    error: undefined,
  };

  static contextType = IntlContext;
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      cashbackWalletId: {
        label: this.context.intl.formatMessage(messages.label),
      },
    },
  });

  render(): Node {
    const { cardanoWallets, error, currentValue, onSetUseSandbox } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const cashbackWalletId = form.$('cashbackWalletId');
    const componentClassNames = classNames([styles.component, 'currency']);

    const optionRenderer = option => {
      return (
        <MenuItem
          key={option.publicDeriverId}
          value={option.publicDeriverId}
          sx={{ height: '60px' }}
          id={'selectCashbackWallet-' + option.name + '-menuItem'}
        >
          <Box sx={{ display: 'flex' }}>
            <WalletIcon imagePart={option.plate.ImagePart} />
            <Box sx={{ marginLeft: '8px' }}>
              <Typography variant="body1" color="ds.text_gray_medium">
                {option.plate.TextPart}&nbsp;|&nbsp;{option.name}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      );
    };

    const dialog = this.props.isSubmitting ? (
      <Dialog title={intl.formatMessage(globalMessages.processingLabel)} closeOnOverlayClick={false}>
        <VerticalFlexContainer>
          <LoadingSpinner />
        </VerticalFlexContainer>
      </Dialog>
    ) : null;

    const mainnetWallets =
      cardanoWallets.filter(({ isTestnet }) => !isTestnet);

    return (
      <Box
        sx={{
          b: '20px',
          mt: '13px',
        }}
        className={componentClassNames}
      >
        {dialog}
        <Typography component="h2" variant="body1" fontWeight={500} mb="16px">
          {intl.formatMessage(messages.bringCashbackTitle)}
        </Typography>

        <Box
          sx={{
            width: '506px',
            marginTop: '0px',
          }}
        >
          <Select
            formControlProps={{ error: !!error }}
            helperText={error && intl.formatMessage(error, error.values)}
            error={!!error}
            {...cashbackWalletId.bind()}
            onChange={this.props.onSelect}
            value={currentValue}
            menuProps={{
              sx: {
                '& .MuiMenu-paper': {
                  maxHeight: '280px',
                },
              },
            }}
            renderValue={value => {
              const wallet = cardanoWallets.find(({ publicDeriverId }) => publicDeriverId === value);
              if (!wallet) {
                throw new Error('unexpected selected value');
              }
              return (
                <Stack direction="row">
                  <WalletIcon imagePart={wallet.plate.ImagePart} />
                  <Typography variant="body1" color="ds.text_gray_medium" mt="2px">
                    {wallet.name} | {wallet.plate.TextPart}
                  </Typography>
                </Stack>
              );
            }}
          >
            {mainnetWallets.map(option => optionRenderer(option))}
          </Select>
          <Typography component="div" variant="caption1" display="inline-block" color="grayscale.700">
            <FormattedMessage {...messages.note} />
          </Typography>
        </Box>
        {onSetUseSandbox != null ? (
          <FormControlLabel
            label="Use Sandbox Backend"
            control={
              <Box ml="8px">
                <RevampSwitch
                  checked={this.props.isUseSandbox ?? false}
                  onChange={event => onSetUseSandbox(event.target.checked)}
                />
              </Box>
            }
            labelPlacement="start"
            sx={{ marginLeft: '0px', marginTop: '40px' }}
          />
        ) : null}
      </Box>
    );
  }
}

export default (BringCashbackSettings: ComponentType<Props>);

const WalletIcon = ({ imagePart }: {| imagePart: string |}) => {
  return (
    <Box
      sx={{
        width: `24px`,
        height: `24px`,
        borderRadius: `8px`,
        alignItems: 'center',
        justifyContent: 'center',
        '& .identicon': {
          borderRadius: `8px`,
        },

        marginRight: '16px',
      }}
    >
      <WalletAccountIcon iconSeed={imagePart} saturationFactor={0} size={8} scalePx={4} />
    </Box>
  );
};

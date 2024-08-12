// @flow
import type { Node, ComponentType } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import moment from 'moment';
import ReadOnlyInput from '../../widgets/forms/ReadOnlyInput';
import globalMessages from '../../../i18n/global-messages';
// import styles from './SpendingPasswordSetting.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import { Box, Button, Typography } from '@mui/material';

const messages = defineMessages({
  passwordLastUpdated: {
    id: 'wallet.settings.passwordLastUpdated',
    defaultMessage: '!!!Last updated',
  },
  unchangedPassword: {
    id: 'wallet.settings.unchangedPassword',
    defaultMessage: '!!!Password unchanged since wallet creation',
  },
  title: {
    id: 'wallet.settings.password.title',
    defaultMessage: '!!!Wallet password',
  },
  passwordDescription: {
    id: 'wallet.settings.password.description',
    defaultMessage:
      '!!!Password is an additional security layer used to confirm transactions from this device. Password is stored locally, so you are only person who can change or restore it.',
  },
  changePassword: {
    id: 'wallet.settings.password.change',
    defaultMessage: '!!!Change password',
  },
});

type Props = {|
  +walletPasswordUpdateDate: ?Date,
  +openDialog: void => void,
  +classicTheme: boolean,
|};

@observer
class SpendingPasswordSetting extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { walletPasswordUpdateDate, classicTheme, renderLayoutComponent } = this.props;
    const passwordMessage =
      walletPasswordUpdateDate == null
        ? intl.formatMessage(messages.unchangedPassword)
        : intl.formatMessage(messages.passwordLastUpdated, {
            lastUpdated: moment(walletPasswordUpdateDate).fromNow(),
          });

    const classicLayout = (
      <ReadOnlyInput
        label={intl.formatMessage(globalMessages.walletPasswordLabel)}
        value={passwordMessage}
        isSet
        onClick={this.props.openDialog}
        classicTheme={classicTheme}
      />
    );

    const revampLayout = (
      <Box mt="13px">
        <Typography
          component="div"
          variant="body1"
          fontWeight={500}
          color="grayscale.900"
          mb="16px"
        >
          {intl.formatMessage(messages.title)}
        </Typography>

        <Typography component="div" variant="body1" color="ds.text_gray_normal" mb="16px">
          {intl.formatMessage(messages.passwordDescription)}
        </Typography>

        <Button
          onClick={this.props.openDialog}
          size="flat"
          variant="contained"
          color="primary"
          id="settings:wallet-changePassword-button"
        >
          {intl.formatMessage(messages.changePassword)}
        </Button>
      </Box>
    );

    return renderLayoutComponent({
      CLASSIC: classicLayout,
      REVAMP: revampLayout,
    });
  }
}

export default (withLayout(SpendingPasswordSetting): ComponentType<Props>);

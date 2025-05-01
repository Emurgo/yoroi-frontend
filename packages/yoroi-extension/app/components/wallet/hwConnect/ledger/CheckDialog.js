// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, IntlContext } from 'react-intl';

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import DialogBackButton from '../../../widgets/DialogBackButton';

import ProgressStepBlock from '../common/ProgressStepBlock';
import HelpLinkBlock from './HelpLinkBlock';
import HWErrorBlock from '../common/HWErrorBlock';

import { ReactComponent as ExternalLinkSVG } from '../../../../assets/images/link-external.inline.svg';
import { ReactComponent as AboutPrerequisiteIconSVG } from '../../../../assets/images/hardware-wallet/check-prerequisite-header-icon.inline.svg';
import { ReactComponent as AboutPrerequisiteTrezorSVG } from '../../../../assets/images/hardware-wallet/ledger/check.inline.svg';
import { ReactComponent as AboutLedgerSVG } from '../../../../assets/images/hardware-wallet/ledger/check-modern.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';

import styles from './CheckDialog.scss';
import {} from '@mui/material';
import { Link, List, ListItem, Typography, styled, Box } from '@mui/material';
import { Stack } from '@mui/material';

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: '8px',
  marginLeft: '8px',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

const messages = defineMessages({
  aboutPrerequisite1Part1: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part1',
    defaultMessage: '!!!Ledger Nano S',
  },
  aboutPrerequisite1Part1Link: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part1.link',
    defaultMessage: '!!!https://shop.ledger.com/products/ledger-nano-s/',
  },
  aboutPrerequisite1Part2: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part2',
    defaultMessage: '!!! or ',
  },
  aboutPrerequisite1Part3: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part3',
    defaultMessage: '!!!Ledger Nano X(Using USB cable)',
  },
  aboutPrerequisite1Part3Link: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.1.part3.link',
    defaultMessage: '!!!https://shop.ledger.com/pages/ledger-nano-x/',
  },
  aboutPrerequisite2: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.2',
    defaultMessage: '!!!Cardano ADA app must be installed on the Ledger device.',
  },
  aboutPrerequisite3: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.3',
    defaultMessage: '!!!Cardano ADA app must remain open on the Ledger device.',
  },
  aboutPrerequisite5: {
    id: 'wallet.connect.ledger.dialog.step.about.prerequisite.5',
    defaultMessage: '!!!Trezor device must remain connected to the computer throughout the process',
  },
});

type Props = {|
  +progressInfo: ProgressInfo,
  +isActionProcessing: boolean,
  +error: ?LocalizableError,
  +onExternalLinkClick: MouseEvent => void,
  +submit: void => void,
  +cancel: void => void,
  +onBack: void => void,
|};

@observer
export default class CheckDialog extends Component<Props> {
  static contextType = IntlContext;
  render(): Node {
    const intl = this.context;
    const {
      progressInfo,
      isActionProcessing,
      error,
      onExternalLinkClick,
      submit,
      cancel,
    } = this.props;

    const middleBlock = (
      <div className={classnames([styles.middleBlock, styles.component])}>
        <AboutLedgerSVG/>

        <div className={styles.prerequisiteBlock}>
          <Stack direction="row" alignItems="center">
            <IconWrapper>
              <AboutPrerequisiteIconSVG />
            </IconWrapper>
            <Typography component="span" className={styles.prerequisiteHeaderText} color="ds.text_gray_medium">
              {intl.formatMessage(globalMessages.hwConnectDialogAboutPrerequisiteHeader)}
            </Typography>
          </Stack>
          <List>
            <ListItem key="1" component="list" sx={{ color: 'ds.text_gray_low', display: 'flex' }}>
              <Link
                sx={{ display: 'flex' }}
                href={intl.formatMessage(messages.aboutPrerequisite1Part1Link)}
                onClick={event => onExternalLinkClick(event)}
              >
                {' '}
                {intl.formatMessage(messages.aboutPrerequisite1Part1) + ' '}{' '}
                <IconWrapper>
                  <ExternalLinkSVG />
                </IconWrapper>
              </Link>
              {intl.formatMessage(messages.aboutPrerequisite1Part2)}
              <Link
                sx={{ display: 'flex', marginLeft: '8px' }}
                href={intl.formatMessage(messages.aboutPrerequisite1Part3Link)}
                onClick={event => onExternalLinkClick(event)}
              >
                {intl.formatMessage(messages.aboutPrerequisite1Part3) + ' '}
                <IconWrapper>
                  <ExternalLinkSVG />
                </IconWrapper>
              </Link>
            </ListItem>
            <ListItem component="list" key="2" sx={{ color: 'ds.text_gray_low' }}>
              {intl.formatMessage(messages.aboutPrerequisite2)}
            </ListItem>
            <ListItem component="list" key="3" sx={{ color: 'ds.text_gray_low' }}>
              {intl.formatMessage(messages.aboutPrerequisite3)}
            </ListItem>
            <ListItem component="list" key="4" sx={{ color: 'ds.text_gray_low' }}>
              {intl.formatMessage(globalMessages.hwConnectDialogAboutPrerequisite4)}
            </ListItem>
            <ListItem component="list" key="5" sx={{ color: 'ds.text_gray_low' }}>
              {intl.formatMessage(messages.aboutPrerequisite5)}
            </ListItem>
          </List>
        </div>
      </div>);

    const dailogActions = [
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        primary: true,
        onClick: submit,
        isSubmitting: isActionProcessing,
      },
    ];

    return (
      <Dialog
        className={classnames([styles.component, 'CheckDialog', styles.ledger])}
        title={intl.formatMessage(globalMessages.ledgerConnectAllDialogTitle)}
        dialogActions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        backButton={<DialogBackButton onBack={this.props.onBack} />}
        onClose={cancel}
      >
        <ProgressStepBlock progressInfo={progressInfo} />
        {middleBlock}
        {error &&
          <HWErrorBlock progressInfo={progressInfo} error={error} />
        }
        <HelpLinkBlock onExternalLinkClick={onExternalLinkClick} />
      </Dialog>
    );
  }
}

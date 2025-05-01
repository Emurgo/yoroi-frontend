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
import { ReactComponent as AboutTrezorSvg } from '../../../../assets/images/hardware-wallet/trezor/check-modern.inline.svg';

import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from '../common/CheckDialog.scss';
import { Link, Box, styled, Stack, Typography } from '@mui/material';

const messages = defineMessages({
  aboutPrerequisite1Part1Text: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1',
    defaultMessage: '!!!Trezor device with version 2.1.0 or later. Supported Trezor models:',
  },
  aboutPrerequisite1Part1ModelTName: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1.modelT',
    defaultMessage: '!!!Model T'
  },
  aboutPrerequisite1Part1Safe3Name: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1.safe3',
    defaultMessage: '!!!Safe 3'
  },
  aboutPrerequisite1Part1Safe5Name: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1.safe5',
    defaultMessage: '!!!Safe 5'
  },
  aboutPrerequisite1Part1LinkModelT: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1.link',
    defaultMessage: '!!!https://trezor.io/trezor-model-t',
  },
  aboutPrerequisite1Part1LinkSafe3: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1.link2',
    defaultMessage: '!!!https://trezor.io/trezor-safe-3',
  },
  aboutPrerequisite1Part1LinkSafe5: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1.link3',
    defaultMessage: '!!!https://trezor.io/trezor-safe-5',
  },
  aboutPrerequisite2: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.2',
    defaultMessage: '!!!Trezor device must be pre-initialized',
  },
  aboutPrerequisite3: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.3',
    defaultMessage: '!!!The Trezor device screen must be unlocked.',
  },
  aboutPrerequisite5: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.5',
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

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

@observer
export default class CheckDialog extends Component<Props> {
  static contextType = IntlContext;
  render(): Node {
    const { intl } = this.context;
    const { progressInfo, isActionProcessing, error, onExternalLinkClick, submit, cancel } = this.props;

    const middleBlock = (
      <div className={classnames([styles.middleBlock, styles.component])}>
        <AboutTrezorSvg/>

        <div className={styles.prerequisiteBlock}>
          <Stack direction="row" gap="8px">
            <IconWrapper>
              <AboutPrerequisiteIconSVG />
            </IconWrapper>
            <Typography className={styles.prerequisiteHeaderText} color="ds.text_gray_low">
              {intl.formatMessage(globalMessages.hwConnectDialogAboutPrerequisiteHeader)}
            </Typography>
          </Stack>
          <Stack>
            <Stack direction="row" alignItems="center" gap="8px">
              <Typography color="ds.text_gray_low">
                &#x2022; {intl.formatMessage(messages.aboutPrerequisite1Part1Text) + ' '}
              </Typography>
              <Typography color="ds.text_gray_low">
                {intl.formatMessage(messages.aboutPrerequisite1Part1ModelTName)}
              </Typography>
              <Link href={intl.formatMessage(messages.aboutPrerequisite1Part1LinkModelT)} onClick={event => onExternalLinkClick(event)}>
                <IconWrapper>
                  <ExternalLinkSVG />
                </IconWrapper>
              </Link>
              <Typography color="ds.text_gray_low">
                {', ' + intl.formatMessage(messages.aboutPrerequisite1Part1Safe3Name)}
              </Typography>
              <Link href={intl.formatMessage(messages.aboutPrerequisite1Part1LinkSafe3)} onClick={event => onExternalLinkClick(event)}>
                <IconWrapper>
                  <ExternalLinkSVG />
                </IconWrapper>
              </Link>
              <Typography color="ds.text_gray_low">
                {', ' + intl.formatMessage(messages.aboutPrerequisite1Part1Safe5Name)}
              </Typography>
              <Link href={intl.formatMessage(messages.aboutPrerequisite1Part1LinkSafe5)} onClick={event => onExternalLinkClick(event)}>
                <IconWrapper>
                  <ExternalLinkSVG />
                </IconWrapper>
              </Link>
            </Stack>
            <Typography color="ds.text_gray_low"> &#x2022; {intl.formatMessage(messages.aboutPrerequisite2)}</Typography>
            <Typography color="ds.text_gray_low">&#x2022; {intl.formatMessage(messages.aboutPrerequisite3)}</Typography>
            <Typography color="ds.text_gray_low">
              &#x2022; {intl.formatMessage(globalMessages.hwConnectDialogAboutPrerequisite4)}
            </Typography>
            <Typography color="ds.text_gray_low">&#x2022; {intl.formatMessage(messages.aboutPrerequisite5)}</Typography>
          </Stack>
        </div>
      </div>
    );

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
        className={classnames([styles.component, 'CheckDialog'])}
        title={intl.formatMessage(globalMessages.trezorConnectAllDialogTitle)}
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

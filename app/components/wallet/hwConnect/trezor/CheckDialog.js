// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import DialogBackButton from '../../../widgets/DialogBackButton';

import ProgressStepBlock from '../common/ProgressStepBlock';
import HelpLinkBlock from './HelpLinkBlock';
import HWErrorBlock from '../common/HWErrorBlock';

import externalLinkSVG from '../../../../assets/images/link-external.inline.svg';
import aboutPrerequisiteIconSVG from '../../../../assets/images/hardware-wallet/check-prerequisite-header-icon.inline.svg';
import aboutPrerequisiteTrezorSVG from '../../../../assets/images/hardware-wallet/trezor/check.inline.svg';
import aboutTrezorSvg from '../../../../assets/images/hardware-wallet/trezor/check-modern.inline.svg';

import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';

import styles from '../common/CheckDialog.scss';

const messages = defineMessages({
  aboutPrerequisite1Part1Text: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1',
    defaultMessage: '!!!Trezor Model T with version 2.0.8',
  },
  aboutPrerequisite1Part1Link: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1.link',
    defaultMessage: '!!!https://shop.trezor.io/product/trezor-model-t',
  },
  aboutPrerequisite1Part2: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part2',
    defaultMessage: '!!!or later',
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
  progressInfo: ProgressInfo,
  isActionProcessing: boolean,
  error: ?LocalizableError,
  onExternalLinkClick: Function,
  submit: Function,
  cancel: Function,
  onBack: void => void,
  classicTheme: boolean,
|};

@observer
export default class CheckDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      progressInfo,
      isActionProcessing,
      error,
      onExternalLinkClick,
      submit,
      cancel,
      classicTheme,
    } = this.props;

    const middleBlock = (
      <div className={classnames([styles.middleBlock, styles.component])}>
        {!classicTheme && <SvgInline svg={aboutTrezorSvg} />}

        <div className={styles.prerequisiteBlock}>
          <div>
            <SvgInline svg={aboutPrerequisiteIconSVG} />
            <span className={styles.prerequisiteHeaderText}>
              {intl.formatMessage(globalMessages.hwConnectDialogAboutPrerequisiteHeader)}
            </span>
          </div>
          <ul>
            <li key="1">
              <a
                href={intl.formatMessage(messages.aboutPrerequisite1Part1Link)}
                onClick={event => onExternalLinkClick(event)}
              >
                {intl.formatMessage(messages.aboutPrerequisite1Part1Text) + ' '}
                <SvgInline svg={externalLinkSVG} />
              </a>
              {intl.formatMessage(messages.aboutPrerequisite1Part2)}
            </li>
            <li key="2">{intl.formatMessage(messages.aboutPrerequisite2)}</li>
            <li key="3">{intl.formatMessage(messages.aboutPrerequisite3)}</li>
            <li key="4">{intl.formatMessage(globalMessages.hwConnectDialogAboutPrerequisite4)}</li>
            <li key="5">{intl.formatMessage(messages.aboutPrerequisite5)}</li>
          </ul>
        </div>

        {classicTheme && (
          <div className={styles.hwImageBlock}>
            <SvgInline svg={aboutPrerequisiteTrezorSVG} />
          </div>
        )}
      </div>);

    const dailogActions = [{
      className: isActionProcessing ? styles.processing : null,
      label: intl.formatMessage(globalMessages.nextButtonLabel),
      primary: true,
      disabled: false,
      onClick: submit,
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'CheckDialog'])}
        title={intl.formatMessage(globalMessages.trezorConnectAllDialogTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        backButton={<DialogBackButton onBack={this.props.onBack} />}
        onClose={cancel}
        classicTheme={classicTheme}
      >
        <ProgressStepBlock progressInfo={progressInfo} classicTheme={classicTheme} />
        {middleBlock}
        {error && <HWErrorBlock progressInfo={progressInfo} error={error} classicTheme={classicTheme} />}
        <HelpLinkBlock onExternalLinkClick={onExternalLinkClick} />
      </Dialog>);
  }
}

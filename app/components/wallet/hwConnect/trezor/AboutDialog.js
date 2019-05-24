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

import ProgressStepBlock from '../common/ProgressStepBlock';
import HelpLinkBlock from './HelpLinkBlock';
import HWErrorBlock from '../common/HWErrorBlock';

import externalLinkSVG from '../../../../assets/images/link-external.inline.svg';
import aboutPrerequisiteIconSVG from '../../../../assets/images/hardware-wallet/about-prerequisite-header-icon.inline.svg';
import aboutPrerequisiteTrezorSVG from '../../../../assets/images/hardware-wallet/trezor/about.inline.svg';
import aboutTrezorSvg from '../../../../assets/images/hardware-wallet/trezor/about-modern.inline.svg';

import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';

import styles from '../common/AboutDialog.scss';
import headerMixin from '../../../mixins/HeaderBlock.scss';

const messages = defineMessages({
  aboutPrerequisite1Part1: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part1',
    defaultMessage: '!!!Only Supports',
  },
  aboutPrerequisite1Part2Link: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part2.link',
    defaultMessage: '!!!https://github.com/trezor/trezor-core/blob/master/ChangeLog',
  },
  aboutPrerequisite1Part2LinkText: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part2.link.text',
    defaultMessage: '!!!Trezor Model T with version 2.0.8',
  },
  aboutPrerequisite1Part3: {
    id: 'wallet.connect.trezor.dialog.step.about.prerequisite.1.part3',
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

type Props = {
  progressInfo: ProgressInfo,
  isActionProcessing: boolean,
  error: ?LocalizableError,
  submit: Function,
  cancel: Function,
  classicTheme: boolean,
};

@observer
export default class AboutDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      progressInfo,
      isActionProcessing,
      error,
      submit,
      cancel,
      classicTheme,
    } = this.props;
    const headerBlockClasses = classicTheme
      ? classnames([headerMixin.headerBlockClassic, styles.headerBlockClassic])
      : classnames([headerMixin.headerBlock, styles.headerBlock]);
    const middleBlockClasses = classicTheme
      ? classnames([styles.middleBlockClassic, styles.middleAboutBlockClassic])
      : classnames([styles.middleBlock, styles.middleAboutBlock]);

    const introBlock = (
      <div className={headerBlockClasses}>
        <span>{intl.formatMessage(globalMessages.hwConnectDialogAboutIntroTextLine1)}</span><br />
        <span>{intl.formatMessage(globalMessages.hwConnectDialogAboutIntroTextLine2)}</span><br />
        <span>{intl.formatMessage(globalMessages.hwConnectDialogAboutIntroTextLine3)}</span><br />
      </div>);

    const middleBlock = (
      <div className={middleBlockClasses}>
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
              {intl.formatMessage(messages.aboutPrerequisite1Part1)}
              <a target="_blank" rel="noopener noreferrer" href={intl.formatMessage(messages.aboutPrerequisite1Part2Link)}>
                {intl.formatMessage(messages.aboutPrerequisite1Part2LinkText)}
                <SvgInline svg={externalLinkSVG} />
              </a>
              {intl.formatMessage(messages.aboutPrerequisite1Part3)}
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
        className={classnames([styles.component, 'AboutDialog'])}
        title={intl.formatMessage(globalMessages.trezorConnectAllDialogTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
        classicTheme={classicTheme}
      >
        <ProgressStepBlock progressInfo={progressInfo} classicTheme={classicTheme} />
        {introBlock}
        {middleBlock}
        <HelpLinkBlock progressInfo={progressInfo} />
        <HWErrorBlock progressInfo={progressInfo} error={error} classicTheme={classicTheme} />
      </Dialog>);
  }
}

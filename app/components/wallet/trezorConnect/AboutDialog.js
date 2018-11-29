// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';

import LocalizableError from '../../../i18n/LocalizableError';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';

import ProgressStepBlock from './common/ProgressStepBlock';
import HelpLinkBlock from './common/HelpLinkBlock';
import ErrorBlock from './common/ErrorBlock';

import externalLinkSVG from '../../../assets/images/link-external.inline.svg';
import aboutPrerequisiteIconSVG from '../../../assets/images/trezor/about-prerequisite-header-icon.inline.svg';
import aboutPrerequisiteTrezorSVG from '../../../assets/images/trezor/about-trezor.inline.svg';

import globalMessages from '../../../i18n/global-messages';

import type { ProgressInfo } from '../../../stores/ada/TrezorConnectStore'
// TODO: remove unwated style
import styles from './AboutDialog.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
    description: 'Label "Connect to Trezor Hardware Wallet" on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutIntroTextLine1: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.1',
    defaultMessage: '!!!A hardware wallet is a small USB device that adds an extra level of security to your wallet.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutIntroTextLine2: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.2',
    defaultMessage: '!!!It is more secure because your private key never leaves the hardware wallet.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutIntroTextLine3: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.3',
    defaultMessage: '!!!Protects your funds when using a computer compromised with viruses, phishing attempts, malware and others.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisiteHeader: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.header',
    defaultMessage: '!!!Prerequisites',
    description: 'Prerequisite header on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part1: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part1',
    defaultMessage: '!!!Only Supports',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part2Link: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part2.link',
    defaultMessage: '!!!https://github.com/trezor/trezor-core/blob/master/ChangeLog',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part2LinkText: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part2.link.text',
    defaultMessage: '!!!Trezor Model T with version 2.0.8',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part3: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part3',
    defaultMessage: '!!!or later',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite2: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.2',
    defaultMessage: '!!!Trezor device must be pre-initialized',
    description: 'Second Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite3: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.3',
    defaultMessage: '!!!The computer needs to be connected to the Internet throughout the process',
    description: 'Third Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite4: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.4',
    defaultMessage: '!!!Only one Trezor device can be connected to the computer at any time',
    description: 'Fourth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite5: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.5',
    defaultMessage: '!!!Trezor device screen must be unlocked',
    description: 'Fifth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite6: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.6',
    defaultMessage: '!!!Trezor device must remain connected to the computer throughout the process',
    description: 'Sixth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  nextButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.next.button.label',
    defaultMessage: '!!!Next',
    description: 'Label for the "Next" button on the Connect to Trezor Hardware Wallet dialog.'
  },  
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  progressInfo: ProgressInfo,
  error: ?LocalizableError,
  submit: Function,
  cancel: Function,
};

@observer
export default class AboutDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;

    // introBlock
    const introBlock = (
      <div className={styles.headerComponent}>
        <span>{intl.formatMessage(messages.aboutIntroTextLine1)}</span><br />
        <span>{intl.formatMessage(messages.aboutIntroTextLine2)}</span><br />
        <span>{intl.formatMessage(messages.aboutIntroTextLine3)}</span><br />
      </div>);

    // middleBlock
    const middleBlock = (
      <div className={classnames([styles.middleComponent, styles.middleComponentAbout])}>
        <div className={styles.prerequisiteBlock}>
          <div>
            <SvgInline svg={aboutPrerequisiteIconSVG} cleanup={['title']} />
            <span className={styles.prerequisiteHeaderText}>
              {intl.formatMessage(messages.aboutPrerequisiteHeader)}
            </span>
          </div>
          <ul>
            <li key="1">
              {intl.formatMessage(messages.aboutPrerequisite1Part1)}
              <a target="_blank" rel="noopener noreferrer" href={intl.formatMessage(messages.aboutPrerequisite1Part2Link)}>
                {intl.formatMessage(messages.aboutPrerequisite1Part2LinkText)}
                <SvgInline svg={externalLinkSVG} cleanup={['title']} />
              </a>
              {intl.formatMessage(messages.aboutPrerequisite1Part3)}
            </li>
            <li key="2">{intl.formatMessage(messages.aboutPrerequisite2)}</li>
            <li key="3">{intl.formatMessage(messages.aboutPrerequisite3)}</li>
            <li key="4">{intl.formatMessage(messages.aboutPrerequisite4)}</li>
            <li key="5">{intl.formatMessage(messages.aboutPrerequisite5)}</li>
            <li key="6">{intl.formatMessage(messages.aboutPrerequisite6)}</li>
          </ul>
        </div>
        <div className={styles.trezorImageBlock}>
          <SvgInline svg={aboutPrerequisiteTrezorSVG} cleanup={['title']} />
        </div>
      </div>);

    const dailogActions = [{
      className: null,
      label: intl.formatMessage(messages.nextButtonLabel),
      primary: true,
      disabled: false,
      onClick: this.props.submit,
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'AboutDialog'])}
        title={intl.formatMessage(messages.title)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.cancel}
      >
        <ProgressStepBlock progressInfo={this.props.progressInfo} />
        {introBlock}
        {middleBlock}
        <HelpLinkBlock />
        <ErrorBlock error={this.props.error} />
      </Dialog>);
  }
}

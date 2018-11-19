// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage } from 'trezor-connect';
import SvgInline from 'react-svg-inline';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';
import type { CardanoGetPublicKey, UiMessage, Features } from '../../../node_modules/trezor-connect/lib/types';

import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';

import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletTrezorDialog.scss';

import externalLinkSVG from '../../assets/images/link-external.inline.svg';
import aboutPrerequisiteIconSVG from '../../assets/images/trezor/about-prerequisite-header-icon.inline.svg';
import aboutPrerequisiteTrezorSVG from '../../assets/images/trezor/about-trezor.inline.svg';
import connectLoadGIF from '../../assets/images/trezor/connect-load.gif';
import connectStartGIF from '../../assets/images/trezor/connect-start.gif';
import connectErrorSVG from '../../assets/images/trezor/connect-error.inline.svg';
import saveLoadGIF from '../../assets/images/trezor/save-load.inline.svg';
import saveStartSVG from '../../assets/images/trezor/save-start.inline.svg';
import saveErrorSVG from '../../assets/images/trezor/save-error.inline.svg';
// import saveSuccessSVG from '../../assets/images/trezor/save-success.inline.svg';

import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { isValidHardwareWalletName } from '../../utils/validations';
import ProgressSteps from '../widgets/ProgressSteps';
import DialogBackButton from '../widgets/DialogBackButton';

import Config from '../../config';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
    description: 'Label "Connect to Trezor Hardware Wallet" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepAboutLabel: {
    id: 'wallet.trezor.dialog.trezor.step.about.label',
    defaultMessage: '!!!ABOUT',
    description: 'Progress Step Label "About" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepConnectLabel: {
    id: 'wallet.trezor.dialog.trezor.step.connect.label',
    defaultMessage: '!!!CONNECT',
    description: 'Progress Step Label "Connect" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepSaveLabel: {
    id: 'wallet.trezor.dialog.trezor.step.save.label',
    defaultMessage: '!!!SAVE',
    description: 'Progress Step Label "Save" on the Connect to Trezor Hardware Wallet dialog.'
  },
  nextButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.next.button.label',
    defaultMessage: '!!!Next',
    description: 'Label for the "Next" button on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.connect.button.label',
    defaultMessage: '!!!Connect',
    description: 'Label for the "Connect" button on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.save.button.label',
    defaultMessage: '!!!Save',
    description: 'Label for the "Save" button on the Connect to Trezor Hardware Wallet dialog.'
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
  helpLinkYoroiWithTrezor: {
    id: 'wallet.trezor.dialog.trezor.common.step.link.helpYoroiWithTrezor',
    defaultMessage: '!!!https://yoroi-wallet.com/',
    description: 'Tutorial link about how to use Yoroi with Trezor on the Connect to Trezor Hardware Wallet dialog.'
  },
  helpLinkYoroiWithTrezorText: {
    id: 'wallet.trezor.dialog.trezor.common.step.link.helpYoroiWithTrezor.text',
    defaultMessage: '!!!Click here to know more about how to use Yoroi with Trezor.',
    description: 'Tutorial link text about how to use Yoroi with Trezor on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectIntroTextLine1: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.1',
    defaultMessage: '!!!After connecting your Trezor device to the computer press the Connect button.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectIntroTextLine2: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.2',
    defaultMessage: '!!!A new tab will appear, please follow the instructions in the new tab.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectIntroTextLine3: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.3',
    defaultMessage: '!!!This process shares the Cardano public key with Yoroi.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectMsgCheckingTrezor: {
    id: 'wallet.trezor.dialog.trezor.step.connect.liveMessage.checkingTrezorDevice',
    defaultMessage: '!!!Checking Trezor device, please follow the instructions on the new tab...',
    description: 'Live message about checking Trezor device of connect start step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError9999: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.9999',
    defaultMessage: '!!!ERROR#TREZOR9999: Something unexpected happened, please retry.',
    description: '<ERROR#TREZOR9999: Something unexpected happened, please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError1001: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.1001',
    defaultMessage: '!!!ERROR#TREZOR1001: Falied to connect trezor.io. Please check your Internet connection and retry.',
    description: '<ERROR#TREZOR1001: Falied to connect trezor.io. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError1002: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.1002',
    defaultMessage: '!!!ERROR#TREZOR1002: Necessary permissions were not granted by the user. Please retry.',
    description: '<ERROR#TREZOR1002: Necessary permissions were not granted by the user. Please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError1003: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.1003',
    defaultMessage: '!!!ERROR#TREZOR1003: Cancelled. Please retry.',
    description: '<ERROR#TREZOR1003: Cancelled. Please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveWalletNameInputLabel: {
    id: 'wallet.trezor.dialog.trezor.step.save.walletName.label',
    defaultMessage: '!!!Wallet name',
    description: 'Label for the wallet name input on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveWalletNameInputPlaceholder: {
    id: 'wallet.restore.dialog.wallet.name.input.hint',
    defaultMessage: '!!!Enter wallet name',
    description: 'Placeholder "Enter wallet name" for the wallet name input on the wallet restore dialog.'
  },
  saveWalletNameInputBottomInfo: {
    id: 'wallet.trezor.dialog.trezor.step.save.walletName.info',
    defaultMessage: '!!!We have fetched Trezor device’s name for you; you can use as it is or assign a different name.',
    description: 'Hint for the wallet name input on the wallet restore dialog.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

const ProgressStep = {
  // ABOUT Page
  ABOUT: 0,
  // CONNECT Page
  CONNECT: 1,
  // SAVE Page
  SAVE: 2,
};

type ProgressState = 'ABOUT' | 'CONNECT_LOAD' | 'CONNECT_START' | 'CONNECT_ERROR' | 'SAVE_LOAD' | 'SAVE_START' | 'SAVE_ERROR';
const ProgressStateOption = {
  // ABOUT Page
  ABOUT: 'ABOUT',
  // CONNECT Page
  CONNECT_LOAD: 'CONNECT_LOAD',
  CONNECT_START: 'CONNECT_START',
  CONNECT_ERROR: 'CONNECT_ERROR',
  // SAVE Page
  SAVE_LOAD: 'SAVE_LOAD',
  SAVE_START: 'SAVE_START',
  SAVE_ERROR: 'SAVE_ERROR',
};

type TrezorDeviceInfo = {
  valid: boolean;
  errorId: string,
  cardanoGetPublicKeyResult: CardanoGetPublicKey, // Trezor device CardanoGetPublicKey object
  features: Features
};

type Props = {
  isSubmitting: boolean,
  onSubmit: Function,
  onCancel: Function,
  error?: ?LocalizableError,
};

type State = {
  currentProgressStepInfo: {
    currentIndex: 0 | 1 | 2,
    error: boolean
  },
  action_btn_name?: string,
  action_btn_processing? : boolean,
  error_or_live_info_text? : string,
}

@observer
export default class WalletTrezorDialog extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  // progress state of this dialog
  progressState: ProgressState = ProgressStateOption.ABOUT;
  // device info which will be used to create wallet (except wallet name)
  // wallet name will be fetched from the user using form
  trezorDeviceInfo: TrezorDeviceInfo;
  // form for wallet name
  form : typeof ReactToolboxMobxForm;
  // Trezor device DeviceMessage event object
  trezorEventDevice: DeviceMessage;

  componentWillMount() {
    const { intl } = this.context;

    this.state = {
      currentProgressStepInfo: {
        currentIndex: ProgressStep.ABOUT,
        error: false
      }
    };

    this.form = new ReactToolboxMobxForm({
      fields: {
        walletName: {
          label: intl.formatMessage(messages.saveWalletNameInputLabel),
          placeholder: intl.formatMessage(messages.saveWalletNameInputPlaceholder),
          value: '',
          validators: [({ field }) => (
            [
              isValidHardwareWalletName(field.value),
              intl.formatMessage(globalMessages.invalidHardwareWalletName)
            ]
          )],
        },
      },
    }, {
      options: {
        validateOnChange: true,
        validationDebounceWait: 250,
      },
    });
    this._updateState();
  }

  /**
   * prepares and updates the UI state
   */
  _updateState = async () => {
    const { intl } = this.context;

    switch (this.progressState) {
      case ProgressStateOption.ABOUT:
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.nextButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.ABOUT;
        this.state.currentProgressStepInfo.error = false;
        this.state.error_or_live_info_text = '';
        break;
      case ProgressStateOption.CONNECT_LOAD:
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.CONNECT;
        this.state.currentProgressStepInfo.error = false;
        this.state.error_or_live_info_text = '';
        break;
      case ProgressStateOption.CONNECT_START:
        this.state.action_btn_processing = true;
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.CONNECT;
        this.state.currentProgressStepInfo.error = false;
        this.state.error_or_live_info_text = intl.formatMessage(messages.connectMsgCheckingTrezor);
        break;
      case ProgressStateOption.CONNECT_ERROR:
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.CONNECT;
        this.state.currentProgressStepInfo.error = true;
        // eslint-disable-next-line max-len
        this.state.error_or_live_info_text = intl.formatMessage(messages[this.trezorDeviceInfo.errorId]);
        break;
      case ProgressStateOption.SAVE_LOAD:
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.SAVE;
        this.state.currentProgressStepInfo.error = false;
        this.form.$('walletName').value = this.trezorDeviceInfo.features.label;
        this.state.error_or_live_info_text = '';
        break;
      case ProgressStateOption.SAVE_START:
        this.state.action_btn_processing = true;
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.SAVE;
        this.state.currentProgressStepInfo.error = false;
        this.state.error_or_live_info_text = '';
        break;
      case ProgressStateOption.SAVE_ERROR:
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.SAVE;
        this.state.currentProgressStepInfo.error = true;
        this.state.error_or_live_info_text = '';
        break;
      default:
        console.error(`[TREZOR] Error state, handle _updateState for: ${this.progressState}`);
        break;
    }
    this.setState({});
  }

  render() {
    const { intl } = this.context;
    const { error, onCancel } = this.props;

    if (error) {
      this.progressState = ProgressStateOption.SAVE_ERROR;
      this.state.action_btn_processing = false;
      this.state.error_or_live_info_text = intl.formatMessage(error);
    }

    const actions = [{
      className: this.state.action_btn_processing ? styles.isProcessing : null,
      label: this.state.action_btn_name,
      primary: true,
      disabled: this.state.action_btn_processing,
      onClick: () => {}
    }];

    const progressStep = (<ProgressSteps
      stepsList={[
        intl.formatMessage(messages.stepAboutLabel),
        intl.formatMessage(messages.stepConnectLabel),
        intl.formatMessage(messages.stepSaveLabel)
      ]}
      progressInfo={this.state.currentProgressStepInfo}
    />);

    const helpLink = (
      <div className={styles.yoroiLinkComponent}>
        <a target="_blank" rel="noopener noreferrer" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
          {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
          <SvgInline svg={externalLinkSVG} cleanup={['title']} />
        </a>
      </div>);

    let dialog = null;

    if (this.progressState === ProgressStateOption.ABOUT) {
      actions[0].onClick = this._onNext;

      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
          {progressStep}
          <div className={styles.headerComponent}>
            <span>{intl.formatMessage(messages.aboutIntroTextLine1)}</span><br />
            <span>{intl.formatMessage(messages.aboutIntroTextLine2)}</span><br />
            <span>{intl.formatMessage(messages.aboutIntroTextLine3)}</span><br />
          </div>
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
          </div>
          {helpLink}
          <div className={styles.liveInfoComponent}>
            <span>{this.state.error_or_live_info_text}</span>
          </div>
        </Dialog>);
    } else if (this.progressState === ProgressStateOption.CONNECT_LOAD ||
      this.progressState === ProgressStateOption.CONNECT_START ||
      this.progressState === ProgressStateOption.CONNECT_ERROR) {
      actions[0].onClick = this._onConnect;

      let backButton = null;
      let middleComponent = null;
      let styleLiveInfo = null;
      if (this.progressState === ProgressStateOption.CONNECT_LOAD) {
        // LOAD
        backButton = (<DialogBackButton onBack={this._onBackToAbout} />);
        middleComponent = (
          <div className={classnames([styles.middleComponent, styles.middleComponentConnectLoad])}>
            <img src={connectLoadGIF} role="presentation" />
          </div>);
        styleLiveInfo = styles.liveInfoComponent;
      } else if (this.progressState === ProgressStateOption.CONNECT_START) {
        // START
        backButton = null;
        middleComponent = (
          <div className={classnames([styles.middleComponent, styles.middleComponentConnectStart])}>
            <img src={connectStartGIF} role="presentation" />
          </div>);
        styleLiveInfo = styles.liveInfoComponent;
      } else {
        // ERROR
        backButton = (<DialogBackButton onBack={this._onBackToAbout} />);
        middleComponent = (
          <div className={classnames([styles.middleComponent, styles.middleComponentConnectError])}>
            <SvgInline svg={connectErrorSVG} cleanup={['title']} />
          </div>);
        styleLiveInfo = classnames([styles.liveInfoComponent, styles.errorBlock]);
      }

      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
          backButton={backButton}
        >
          {progressStep}
          <div className={styles.headerComponent}>
            <span>{intl.formatMessage(messages.connectIntroTextLine1)}</span><br />
            <span>{intl.formatMessage(messages.connectIntroTextLine2)}</span><br />
            <span>{intl.formatMessage(messages.connectIntroTextLine3)}</span><br />
          </div>
          {middleComponent}
          {helpLink}
          <div className={styleLiveInfo}>
            <span>{this.state.error_or_live_info_text}</span>
          </div>
        </Dialog>);
    } else if (this.progressState === ProgressStateOption.SAVE_LOAD ||
      this.progressState === ProgressStateOption.SAVE_START ||
      this.progressState === ProgressStateOption.SAVE_ERROR) {
      actions[0].onClick = this._onSave;
      let middleComponent = null;
      let styleLiveInfo = null;
      if (this.progressState === ProgressStateOption.SAVE_LOAD) {
        // LOAD
        middleComponent = (
          <div className={classnames([styles.middleComponent, styles.middleComponentSaveLoad])}>
            <SvgInline svg={saveLoadGIF} cleanup={['title']} />
          </div>);
        styleLiveInfo = styles.liveInfoComponent;
      } else if (this.progressState === ProgressStateOption.SAVE_START) {
        // START
        middleComponent = (
          <div className={classnames([styles.middleComponent, styles.middleComponentSaveStart])}>
            <SvgInline svg={saveStartSVG} cleanup={['title']} />
          </div>);
        styleLiveInfo = styles.liveInfoComponent;
      } else {
        // ERROR
        middleComponent = (
          <div className={classnames([styles.middleComponent, styles.middleComponentSaveError])}>
            <SvgInline svg={saveErrorSVG} cleanup={['title']} />
          </div>);
        styleLiveInfo = classnames([styles.liveInfoComponent, styles.errorBlock]);
      }
      const walletNameFieldClasses = classnames([
        'walletName',
        styles.walletName,
      ]);
      const walletNameField = this.form.$('walletName');
      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
          {progressStep}
          <div className={classnames([styles.headerComponent, styles.headerComponentSave])}>
            <Input
              className={walletNameFieldClasses}
              {...walletNameField.bind()}
              error={walletNameField.error}
              skin={<SimpleInputSkin />}
            />
            <span>{intl.formatMessage(messages.saveWalletNameInputBottomInfo)}</span>
          </div>
          {middleComponent}
          {helpLink}
          <div className={styleLiveInfo}>
            <span>{this.state.error_or_live_info_text}</span>
          </div>
        </Dialog>);
    } else {
      console.error(`[TREZOR] Error state, handle render for: ${this.progressState}`);
    }

    return dialog;
  }

  _onBackToAbout = async () => {
    this.progressState = ProgressStateOption.ABOUT;
    await this._updateState();
  }

  _onNext = async () => {
    this.progressState = ProgressStateOption.CONNECT_LOAD;
    await this._updateState();
  }

  _onConnect = async () => {
    let cardanoGetPublicKeyResp : CardanoGetPublicKey | any = null;

    try {
      this._addTrezorConnectEventListeners();
      this.progressState = ProgressStateOption.CONNECT_START;
      await this._updateState();

      cardanoGetPublicKeyResp = await TrezorConnect.cardanoGetPublicKey({
        path: Config.trezor.DEFAULT_CARDANO_PATH
      });
    } catch (error) {
      console.error('[TREZOR] TrezorConnectError cardanoGetPublicKey : ' + JSON.stringify(error, null, ''));
    } finally {
      this._removeTrezorConnectEventListeners();
      this._validateTrezorResponse(cardanoGetPublicKeyResp);

      if (this._isTrezorResponseValid()) {
        this.progressState = ProgressStateOption.SAVE_LOAD;
      } else {
        this.progressState = ProgressStateOption.CONNECT_ERROR;
      }

      await this._updateState();
    }
  }

  _addTrezorConnectEventListeners = () => {
    if (TrezorConnect) {
      TrezorConnect.on(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.on(UI_EVENT, this._onTrezorUIEvent);
    } else {
      throw new Error('TrezorConnect not installed');
    }
  }

  _removeTrezorConnectEventListeners = () => {
    if (TrezorConnect) {
      TrezorConnect.off(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.off(UI_EVENT, this._onTrezorUIEvent);
    }
  }

  _onTrezorDeviceEvent = (event: DeviceMessage) => {
    console.log(`[TREZOR] DEVICE_EVENT: ${event.type}`);
    this.trezorEventDevice = event;
  }

  _onTrezorUIEvent = (event: UiMessage) => {
    console.log(`[TREZOR] UI_EVENT: ${event.type}`);
    // FIXME: check about TrezorBridge/WebUSB inconsistency
    // FIXME: trezord forces close issue
    // if(event.type === CLOSE_UI_WINDOW &&
    //   this.progressState === ProgressStateOption.CONNECT_START &&
    //   this.publicKeyInfo.valid === false) {
    //   this.progressState = ProgressStateOption.CONNECT_ERROR;
    //   this.publicKeyInfo.errorId = 'trezord forcefully stopped';
    //   this._updateState();
    // }
  }

  /**
   * Validates the compatibility of data which we have received from Trezor
   */
  _validateTrezorResponse = (cardanoGetPublicKeyResp: CardanoGetPublicKey) => {
    const trezorDeviceInfo = {};
    trezorDeviceInfo.valid = false;
    trezorDeviceInfo.errorId = '';

    if (!cardanoGetPublicKeyResp.success) {
      switch (cardanoGetPublicKeyResp.payload.error) {
        case 'Iframe timeout':
          trezorDeviceInfo.errorId = 'connectError1001';
          break;
        case 'Permissions not granted':
          trezorDeviceInfo.errorId = 'connectError1002';
          break;
        case 'Popup closed':
          trezorDeviceInfo.errorId = 'connectError1003';
          break;
        default:
          // connectError9999 = Something unexpected happened
          trezorDeviceInfo.errorId = 'connectError9999';
          break;
      }
    }

    if (!trezorDeviceInfo.errorId && cardanoGetPublicKeyResp.payload.publicKey.length <= 0) {
      trezorDeviceInfo.errorId = 'connectError9999';
    }

    // FIXME: try to use constants defined in Trezor for 'acquired'
    if (!trezorDeviceInfo.errorId && this.trezorEventDevice.payload.type !== 'acquired') {
      trezorDeviceInfo.errorId = 'connectError9999';
    }

    if (!trezorDeviceInfo.errorId) {
      // FIXME: try to use constants defined in Trezor for 'acquired'
      if (this.trezorEventDevice.payload.type === 'acquired') {
        // if is unwanted, but used because flow needs that
        trezorDeviceInfo.features = Object.assign({}, this.trezorEventDevice.payload.features);
      }
      trezorDeviceInfo.valid = true;
      trezorDeviceInfo.cardanoGetPublicKeyResult = cardanoGetPublicKeyResp;
    }

    this.trezorDeviceInfo = trezorDeviceInfo;
  }

  _isTrezorResponseValid() {
    return this.trezorDeviceInfo.valid;
  }

  _onSave = async () => {
    this.form.submit({
      onSuccess: async (form) => {
        this.progressState = ProgressStateOption.SAVE_START;
        await this._updateState();

        const { walletName } = form.values();
        const walletData = {
          publicMasterKey: this.trezorDeviceInfo.cardanoGetPublicKeyResult.payload.publicKey,
          walletName,
          deviceFeatures: this.trezorDeviceInfo.features
        };
        this.props.onSubmit(walletData);
      },
      onError: () => {
      },
    });
  }

  componentWillUnmount() {
    this._removeTrezorConnectEventListeners();
    if (TrezorConnect) {
      TrezorConnect.dispose();
    }
  }
}

// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';

import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage, Features, UiMessage } from 'trezor-connect';
import type { CardanoGetPublicKey } from '../../../node_modules/trezor-connect/lib/types';

import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';

import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';

import externalLinkSVG from '../../assets/images/link-external.inline.svg';
import aboutPrerequisiteIconSVG from '../../assets/images/trezor/about-prerequisite-header-icon.inline.svg';
import aboutPrerequisiteTrezorSVG from '../../assets/images/trezor/about-trezor.inline.svg';
import connectLoadGIF from '../../assets/images/trezor/connect-load.gif';
import connectStartGIF from '../../assets/images/trezor/connect-start.gif';
import connectErrorSVG from '../../assets/images/trezor/connect-error.inline.svg';
import saveLoadGIF from '../../assets/images/trezor/save-load.inline.svg';
import saveStartSVG from '../../assets/images/trezor/save-start.inline.svg';
import saveErrorSVG from '../../assets/images/trezor/save-error.inline.svg';

import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { isValidHardwareWalletName } from '../../utils/validations';
import ProgressSteps from '../widgets/ProgressSteps';
import DialogBackButton from '../widgets/DialogBackButton';

import Config from '../../config';

import styles from './WalletTrezorDialog.scss';

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
  connectError999: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.999',
    defaultMessage: '!!!Something unexpected happened, please retry.',
    description: '<Something unexpected happened, please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError101: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.101',
    defaultMessage: '!!!Falied to connect trezor.io. Please check your Internet connection and retry.',
    description: '<Falied to connect trezor.io. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError102: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.102',
    defaultMessage: '!!!Necessary permissions were not granted by the user. Please retry.',
    description: '<Necessary permissions were not granted by the user. Please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError103: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.103',
    defaultMessage: '!!!Cancelled. Please retry.',
    description: '<Cancelled. Please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveError101: {
    id: 'wallet.trezor.dialog.trezor.step.save.error.101',
    defaultMessage: '!!!Falied to save. Please check your Internet connection and retry.',
    description: '<Falied to save. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
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
  error: ?{
    id: string,
    defaultMessage: string,
    description: string
  },
  cardanoGetPublicKeyResult: CardanoGetPublicKey, // Trezor device CardanoGetPublicKey object
  features: Features // Trezor device CardanoGetPublicKey object
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
  actionButtonName?: string,
  isActionProcessing? : boolean,
  errorOrLiveInfoText? : string,
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
  form: typeof ReactToolboxMobxForm;
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

  render() {
    const { intl } = this.context;
    const { error, onCancel } = this.props;

    if (error) {
      this.progressState = ProgressStateOption.SAVE_ERROR;
      this.state.isActionProcessing = false;

      this.state.actionButtonName = intl.formatMessage(messages.saveButtonLabel);
      this.state.currentProgressStepInfo.currentIndex = ProgressStep.SAVE;
      this.state.currentProgressStepInfo.error = true;

      if (error instanceof CheckAdressesInUseApiError) {
        // redirecting CheckAdressesInUseApiError -> saveError101
        // because for user saveError101 is more meaningful in this context
        this.state.errorOrLiveInfoText = intl.formatMessage(messages.saveError101);
      } else {
        this.state.errorOrLiveInfoText = intl.formatMessage(error);
      }
    }

    const actions = [{
      className: this.state.isActionProcessing ? styles.isProcessing : null,
      label: this.state.actionButtonName,
      primary: true,
      disabled: this.state.isActionProcessing,
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
            <span>{this.state.errorOrLiveInfoText}</span>
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
            <img src={connectLoadGIF} alt="" />
          </div>);
        styleLiveInfo = styles.liveInfoComponent;
      } else if (this.progressState === ProgressStateOption.CONNECT_START) {
        // START
        backButton = null;
        middleComponent = (
          <div className={classnames([styles.middleComponent, styles.middleComponentConnectStart])}>
            <img src={connectStartGIF} alt="" />
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
            <span>{this.state.errorOrLiveInfoText}</span>
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
            <span>{this.state.errorOrLiveInfoText}</span>
          </div>
        </Dialog>);
    } else {
      console.error(`[TREZOR] Error state, handle render for: ${this.progressState}`);
    }

    return dialog;
  }

  componentWillUnmount() {
    this._removeTrezorConnectEventListeners();
    if (TrezorConnect) {
      TrezorConnect.dispose();
    }
  }

  /**
   * prepares and updates the UI state
   */
  _updateState = async () => {
    const { intl } = this.context;

    switch (this.progressState) {
      case ProgressStateOption.ABOUT:
        this.state.isActionProcessing = false;
        this.state.actionButtonName = intl.formatMessage(messages.nextButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.ABOUT;
        this.state.currentProgressStepInfo.error = false;
        this.state.errorOrLiveInfoText = '';
        break;
      case ProgressStateOption.CONNECT_LOAD:
        this.state.isActionProcessing = false;
        this.state.actionButtonName = intl.formatMessage(messages.connectButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.CONNECT;
        this.state.currentProgressStepInfo.error = false;
        this.state.errorOrLiveInfoText = '';
        break;
      case ProgressStateOption.CONNECT_START:
        this.state.isActionProcessing = true;
        this.state.actionButtonName = intl.formatMessage(messages.connectButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.CONNECT;
        this.state.currentProgressStepInfo.error = false;
        this.state.errorOrLiveInfoText = intl.formatMessage(messages.connectMsgCheckingTrezor);
        break;
      case ProgressStateOption.CONNECT_ERROR:
        this.state.isActionProcessing = false;
        this.state.actionButtonName = intl.formatMessage(messages.connectButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.CONNECT;
        this.state.currentProgressStepInfo.error = true;
        // eslint-disable-next-line max-len
        this.state.errorOrLiveInfoText = intl.formatMessage(this.trezorDeviceInfo.error);
        break;
      case ProgressStateOption.SAVE_LOAD:
        this.state.isActionProcessing = false;
        this.state.actionButtonName = intl.formatMessage(messages.saveButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.SAVE;
        this.state.currentProgressStepInfo.error = false;
        this.form.$('walletName').value = this.trezorDeviceInfo.features.label;
        this.state.errorOrLiveInfoText = '';
        break;
      case ProgressStateOption.SAVE_START:
        this.state.isActionProcessing = true;
        this.state.actionButtonName = intl.formatMessage(messages.saveButtonLabel);
        this.state.currentProgressStepInfo.currentIndex = ProgressStep.SAVE;
        this.state.currentProgressStepInfo.error = false;
        this.state.errorOrLiveInfoText = '';
        break;
      case ProgressStateOption.SAVE_ERROR:
        // managed in render()
        break;
      default:
        console.error(`[TREZOR] Error state, handle _updateState for: ${this.progressState}`);
        break;
    }
    this.setState({});
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

      const trezorEventDevice = { ...this.trezorEventDevice };
      const trezorValidity = this._validateTrezor(cardanoGetPublicKeyResp, trezorEventDevice);

      const trezorDeviceInfo = {};
      trezorDeviceInfo.valid = trezorValidity.valid;
      trezorDeviceInfo.error = trezorValidity.error;
      trezorDeviceInfo.cardanoGetPublicKeyResult = cardanoGetPublicKeyResp;
      if (trezorEventDevice.payload.type === 'acquired') {
        trezorDeviceInfo.features = trezorEventDevice.payload.features;
      }
      this.trezorDeviceInfo = trezorDeviceInfo;

      if (trezorDeviceInfo.valid) {
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
    // FIXME: https://github.com/Emurgo/yoroi-frontend/issues/126
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
  _validateTrezor = (
    cardanoGetPublicKeyResp: CardanoGetPublicKey,
    trezorEventDevice: DeviceMessage
  ):{
      valid: boolean,
      error: ?LocalizableError
    } => {
    const trezorValidity = {
      valid: false,
      error: null,
    };

    if (!cardanoGetPublicKeyResp.success) {
      switch (cardanoGetPublicKeyResp.payload.error) {
        case 'Iframe timeout':
          trezorValidity.error = messages.connectError101;
          break;
        case 'Permissions not granted':
          trezorValidity.error = messages.connectError102;
          break;
        case 'Cancelled':
        case 'Popup closed':
          trezorValidity.error = messages.connectError103;
          break;
        default:
          // connectError999 = Something unexpected happened
          trezorValidity.error = messages.connectError999;
          break;
      }
    }

    if (!trezorValidity.error && cardanoGetPublicKeyResp.payload.publicKey.length <= 0) {
      trezorValidity.error = messages.connectError999;
    }

    if (!trezorValidity.error && trezorEventDevice.payload.type !== 'acquired') {
      trezorValidity.error = messages.connectError999;
    }

    if (!trezorValidity.error) {
      trezorValidity.valid = true;
    }

    return trezorValidity;
  }

  _onSave = async () => {
    this.form.submit({
      onSuccess: async (form) => {
        this.progressState = ProgressStateOption.SAVE_START;
        await this._updateState();

        const { walletName } = form.values();
        const walletData = {
          walletName,
          publicMasterKey: this.trezorDeviceInfo.cardanoGetPublicKeyResult.payload.publicKey,
          deviceFeatures: this.trezorDeviceInfo.features
        };
        this.props.onSubmit(walletData);
      },
      onError: () => {
      },
    });
  }
}

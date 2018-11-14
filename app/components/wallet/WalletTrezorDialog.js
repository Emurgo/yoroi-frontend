// @flow
// FIXME : Better Logging overall
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import TrezorConnect, { UI, UI_EVENT, DEVICE, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage } from 'trezor-connect';
import { CONNECT, CONNECT_UNACQUIRED, DISCONNECT, CHANGED, ACQUIRE, RELEASE, ACQUIRED, RELEASED, USED_ELSEWHERE} from '../../../node_modules/trezor-connect/lib/constants/device';
import { CLOSE_UI_WINDOW } from '../../../node_modules/trezor-connect/lib/constants/ui';
import type { CardanoGetPublicKey, UiMessage, Features, Device } from '../../../node_modules/trezor-connect/lib/types';

import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';

import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletTrezorDialog.scss';

import SvgInline from 'react-svg-inline';
import gifIcon from '../../assets/images/trezor/connecting.gif';
import prerequisiteIconSVG from '../../assets/images/trezor/icon-prerequisite.inline.svg';
import prerequisiteTrezorSVG from '../../assets/images/trezor/picture-about.inline.svg';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { isValidHardwareWalletName } from '../../utils/validations';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';
import ProgressSteps from '../widgets/ProgressSteps';
import DialogBackButton from '../widgets/DialogBackButton';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
    description: 'Label "Connect to Trezor Hardware Wallet" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepAboutLabel:{
    id: 'wallet.trezor.dialog.trezor.step.about.label',
    defaultMessage: '!!!ABOUT',
    description: 'Progress Step Label "About" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepConnectLabel:{
    id: 'wallet.trezor.dialog.trezor.step.connect.label',
    defaultMessage: '!!!CONNECT',
    description: 'Progress Step Label "Connect" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepSaveLabel:{
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
  aboutHeaderLine1: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.1',
    defaultMessage: '!!!Trezor hardware wallet is a small USB device that allows you to access your wallet quickly, safely & easily.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutHeaderLine2: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.2',
    defaultMessage: '!!!It is more secure because your private key never leaves the hardware wallet.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutHeaderLine3: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.3',
    defaultMessage: '!!!It protects you from phishing, malware, and more.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },    
  aboutPrerequisiteHeader: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.header',
    defaultMessage: '!!!Prerequisite',
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
    defaultMessage: '!!!Trezor Model T with Version 2.0.8',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part3: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part3',
    defaultMessage: '!!!or later',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },      
  aboutPrerequisite2: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.2',
    defaultMessage: '!!!Device Frimware should be greater than or equal to 2.0.8',
    description: 'Second Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite3: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.3',
    defaultMessage: '!!!Device should be pre-initialized, if not then first goto https://trezor.io/start/',
    description: 'Third Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite4: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.4',
    defaultMessage: '!!!make sure you are connected to internet throught the process',
    description: 'Fourth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite5: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.5',
    defaultMessage: '!!!connect only one(not multiple) Trezor Model T device to computer\'s USB port',
    description: 'Fifth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite6: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.6',
    defaultMessage: '!!!Trezor Model T device screen must be in unlocked state',
    description: 'Sixth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite7: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.7',
    defaultMessage: '!!!do not remove the device from USB port throught the connection process',
    description: 'Seventh Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
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
  connectHeader: {
    id: 'wallet.trezor.dialog.trezor.step.connect.header',
    defaultMessage: '!!!After Connecting your Trezor device to USB port please press \"Connect\" button. A new tab will appear, please perform needed actions on new tab.',
    description: 'Header text of connect step on the Connect to Trezor Hardware Wallet dialog.'
  },  
  walletNameInputLabel: {
    id: 'wallet.trezor.dialog.wallet.name.input.label',
    defaultMessage: '!!!Give a wallet name',
    description: 'Label for the wallet name input on the wallet restore dialog.'
  },  
  walletNameInputHint: {
    id: 'wallet.restore.dialog.wallet.name.input.hint',
    defaultMessage: '!!!Enter wallet name',
    description: 'Hint "Enter wallet name" for the wallet name input on the wallet restore dialog.'
  },  
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type ProgressState = 'ABOUT' | 'CONNECT_LOAD' | 'CONNECT_START' | 'CONNECT_ERROR' | 'SAVE_LOAD' | 'SAVE_START' | 'SAVE_ERROR' ;
const ProgressStateOption = {
  // ABOUT Page
  'ABOUT': 'ABOUT',
  // CONNECT Page
  'CONNECT_LOAD': 'CONNECT_LOAD',
  'CONNECT_START': 'CONNECT_START',
  'CONNECT_ERROR': 'CONNECT_ERROR',
  // SAVE Page
  'SAVE_LOAD': 'SAVE_LOAD',
  'SAVE_START': 'SAVE_START',
  'SAVE_ERROR': 'SAVE_ERROR',
};

type TrezorDeviceInfo = {
  valid: boolean;
  errorId: string,
  trezorCardanoGetPublicKeyResult: CardanoGetPublicKey, // Trezor device CardanoGetPublicKey object
  features: Features
};

type Props = {
  isSubmitting: boolean,
  onSubmit: Function,
  onCancel: Function,
  error?: ?LocalizableError,
};

type State = {
  isSubmitting?: boolean, // FIXME : remove duplicate
  currentProgressStep: 0 | 1 | 2,
  action_btn_name?: string,
  action_btn_processing? : boolean,
  error_live_info_text? : string,
}

@observer
export default class WalletTrezorDialog extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  progressState: ProgressState; //
  trezorEventDevice: DeviceMessage; // Trezor device DeviceMessage event object
  trezorDeviceInfo: TrezorDeviceInfo; // Stores device info which will be used to create wallet (except wallet name)
  form : typeof ReactToolboxMobxForm;

  /**
   *
   * @param {*} props
   */
  constructor(props: Props) {
    super(props);
    this._init();
  }

  _init() {
    this.progressState = ProgressStateOption.ABOUT;
    this.state = {
      currentProgressStep: 0
    };
  }

  componentWillMount() {
    const { intl } = this.context;    
    this.form = new ReactToolboxMobxForm({
      fields: {
        walletName: {
          label: intl.formatMessage(messages.walletNameInputLabel),
          placeholder: intl.formatMessage(messages.walletNameInputHint),
          value: '',
          validators: [({ field }) => (
            [
              isValidHardwareWalletName(field.value),
              intl.formatMessage(globalMessages.invalidWalletName)
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
    // FIXME: better component division
    const { intl } = this.context;
    const { isSubmitting, error, onCancel } = this.props;

    const dialogClasses = classnames([styles.component, 'WalletTrezorDialog']);

    const infoImage = (<div><img src={gifIcon} height="297" width="725" alt={'TRY CONNECT ANIMATION'}/></div>);
    const errorArea = (<div>{this.state.error_live_info_text}</div>);

    const progressStep = (<ProgressSteps
      stepsList={[
        intl.formatMessage(messages.stepAboutLabel),
        intl.formatMessage(messages.stepConnectLabel),
        intl.formatMessage(messages.stepSaveLabel)        
      ]}
      progressIndex={this.state.currentProgressStep}
    />);

    const walletNameFieldClasses = classnames([
      'walletName',
      styles.walletName,
    ]);
    const walletNameField = this.form.$('walletName');    

    let dialog = null;

    if(this.progressState === ProgressStateOption.ABOUT) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isSubmitting : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onNext
      }];
      dialog = (
        <Dialog
          className={dialogClasses}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={styles.topComponent}>
          <span>{intl.formatMessage(messages.aboutHeaderLine1)}</span><br/>
          <span>{intl.formatMessage(messages.aboutHeaderLine2)}</span><br/>
          <span>{intl.formatMessage(messages.aboutHeaderLine3)}</span><br/>
        </div>
        <div className={styles.middleComponent}>
          <div className={styles.prerequisiteBlock}>
            <div>
              <SvgInline svg={prerequisiteIconSVG} cleanup={['title']} />
              <span className={styles.prerequisiteHeaderText}>{intl.formatMessage(messages.aboutPrerequisiteHeader)}</span>
            </div>
            <ul>
              <li key="1">{intl.formatMessage(messages.aboutPrerequisite1Part1)}<a target="_blank" href={intl.formatMessage(messages.aboutPrerequisite1Part2Link)}>{intl.formatMessage(messages.aboutPrerequisite1Part2LinkText)}</a>{intl.formatMessage(messages.aboutPrerequisite1Part3)}</li>
              <li key="2">{intl.formatMessage(messages.aboutPrerequisite2)}</li>
              <li key="3">{intl.formatMessage(messages.aboutPrerequisite3)}</li>
              <li key="4">{intl.formatMessage(messages.aboutPrerequisite4)}</li>
              <li key="5">{intl.formatMessage(messages.aboutPrerequisite5)}</li>
              <li key="6">{intl.formatMessage(messages.aboutPrerequisite6)}</li>
            </ul>
            <br/>
            <span>[ *Trezor One model support will come soon. ]</span>
          </div>
          <div className={styles.trezorImageBlock}>
            <SvgInline svg={prerequisiteTrezorSVG} cleanup={['title']} />
          </div>          
        </div>
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>{intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}</a>
        </div>
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          {errorArea}
        </div>        
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_LOAD) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isSubmitting : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onConnect
      }];
      dialog = (
        <Dialog
          className={dialogClasses}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
          backButton={<DialogBackButton onBack={this.onBackToIntro} />}
        >
        {progressStep}
        <div className={styles.topComponent}>{intl.formatMessage(messages.connectHeader)}</div>
        <div className={styles.middleComponent}>
          {infoImage}
        </div>
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>{intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}</a>
        </div>        
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          {errorArea}
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_START) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isSubmitting : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onConnect
      }];
      dialog = (
        <Dialog
          className={dialogClasses}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={styles.topComponent}>{intl.formatMessage(messages.connectHeader)}</div>
        <div className={styles.middleComponent}>
          {infoImage}        
        </div>
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>{intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}</a>
        </div>        
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          {errorArea}
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_ERROR) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isSubmitting : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onConnect
      }];
      dialog = (
        <Dialog
          className={dialogClasses}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
          backButton={<DialogBackButton onBack={this.onBackToIntro} />}
        >
        {progressStep}
        <div className={styles.topComponent}>{intl.formatMessage(messages.connectHeader)}</div>
        <div className={styles.middleComponent}>
        </div>
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>{intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}</a>
        </div>        
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          {errorArea}
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_LOAD) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isSubmitting : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onSave
      }];

      dialog = (
        <Dialog
          className={dialogClasses}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={styles.topComponent}>
          <Input
            className={walletNameFieldClasses}
            {...walletNameField.bind()}
            error={walletNameField.error}
            skin={<SimpleInputSkin />}
          />
          <div>We have fetched Trezor device wallet name for you, you can use as it is or give a different name.</div>
        </div>
        <div className={styles.middleComponent}>
        </div>
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>{intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}</a>
        </div>        
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          {errorArea}
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_START) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isSubmitting : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onSave
      }];
      dialog = (
        <Dialog
          className={dialogClasses}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={styles.topComponent}>
          <Input
            className={walletNameFieldClasses}
            {...walletNameField.bind()}
            error={walletNameField.error}
            skin={<SimpleInputSkin />}
          />
        </div>
        <div className={styles.middleComponent}>
        </div>
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>{intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}</a>
        </div>        
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          {errorArea}
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_ERROR) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isSubmitting : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onSave
      }];
      dialog = (
        <Dialog
          className={dialogClasses}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={styles.topComponent}>
          <Input
            className={walletNameFieldClasses}
            {...walletNameField.bind()}
            error={walletNameField.error}
            skin={<SimpleInputSkin />}
          />
        </div>
        <div className={styles.middleComponent}>
        </div>
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>{intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}</a>
        </div>        
        <div className={classnames([styles.bottomComponent, styles.trezorWebsiteLink])}>
          {errorArea}
        </div>
        </Dialog>
      );    
    } else {
      console.error(`UNHANDLED STATE, Please handle RENDERER for: ${this.progressState}`);
    }

    return dialog;
  }

  _updateState = async () => {
    const { intl } = this.context;

    switch(this.progressState) {
      case ProgressStateOption.ABOUT:
        this.state.currentProgressStep = 0;
        this.state.action_btn_processing = false;
        this.state.action_btn_name = 'Next';
        this.state.error_live_info_text = '';
        break;      
      case ProgressStateOption.CONNECT_LOAD:
        this.state.currentProgressStep = 1;
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        this.state.error_live_info_text = '';
        break;
      case ProgressStateOption.CONNECT_START:
        this.state.currentProgressStep = 1;
        this.state.action_btn_processing = true;
        this.state.error_live_info_text = 'Checking Trezor device...'
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        break;
      case ProgressStateOption.CONNECT_ERROR:
        this.state.action_btn_processing = false;
        this.state.error_live_info_text = this.trezorDeviceInfo.errorId;
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        break;        
      case ProgressStateOption.SAVE_LOAD:
        this.state.currentProgressStep = 2;
        this.state.action_btn_processing = false;
        this.form.$('walletName').value = this.trezorDeviceInfo.features.label;
        this.state.error_live_info_text = '';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;
       case ProgressStateOption.SAVE_START:
         this.state.currentProgressStep = 2;
        this.state.action_btn_processing = true;
        this.state.error_live_info_text = '';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;
      case ProgressStateOption.SAVE_ERROR:
        this.state.currentProgressStep = 2;
        this.state.action_btn_processing = false;
        this.state.error_live_info_text = '';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;                       
      default:
        console.error(`ERROR STATE, HANDLE UPDATE-PROGRESS: ${this.progressState}`);
        break;
    }
    this.setState({});
  }

  onBackToIntro = async () => {
    this.progressState = ProgressStateOption.ABOUT;
    await this._updateState();
  }

  onNext = async () => {
    this.progressState = ProgressStateOption.CONNECT_LOAD;
    await this._updateState();
  }

  onConnect = async () => {
    // FIXME: check about TrezorBridge/WebUSB 
    let trezorCardanoGetPublicKeyResp : CardanoGetPublicKey | any = null;

    try {
      await this._addTrezorConnectEventListeners();
      this.progressState = ProgressStateOption.CONNECT_START;
      await this._updateState();
      // FIXME : find better place to store constants
      trezorCardanoGetPublicKeyResp = await TrezorConnect.cardanoGetPublicKey({ path: 'm/44\'/1815\'/0\'' });
    } catch (error) {
      // FIXME: proper error handling
      console.error('TrezorConnectError onConnect : ' + JSON.stringify(error, null, ''));
    } finally {
      await this._removeTrezorConnectEventListeners();
      await this._validateTrezorResponse(trezorCardanoGetPublicKeyResp);

      if(this._isTrezorResponseValid()) {
        this.progressState = ProgressStateOption.SAVE_LOAD;
      } else {
        this.progressState = ProgressStateOption.CONNECT_ERROR;
      }

      await this._updateState();
    }
  }

  _addTrezorConnectEventListeners = async () => {
    TrezorConnect.on(DEVICE_EVENT, this._onTrezorDeviceEvent.bind(this));
    TrezorConnect.on(UI_EVENT, this._onTrezorUIEvent.bind(this));
  }
  
  _removeTrezorConnectEventListeners = async () => {
    TrezorConnect.off(DEVICE_EVENT, this._onTrezorDeviceEvent);
    TrezorConnect.off(UI_EVENT, this._onTrezorUIEvent);
  }

  _onTrezorDeviceEvent = (event: DeviceMessage) => {
    console.log(`Trezor DEVICE_EVENT: ${event.type} : ` + JSON.stringify(event, null, ' '));
    this.trezorEventDevice = event;
  }

  _onTrezorUIEvent = (event: UiMessage) => {
    console.log(`Trezor UI_EVENT : ${event.type} : ` + JSON.stringify(event, null, ' '));
    // FIXME: trezord forces close
    // if(event.type === CLOSE_UI_WINDOW && 
    //   this.progressState === ProgressStateOption.CONNECT_START &&
    //   this.publicKeyInfo.valid === false) {
    //   this.progressState = ProgressStateOption.CONNECT_ERROR;
    //   this.publicKeyInfo.errorId = 'trezord forcefully stopped';
    //   this._updateState();
    // }
  }  

  _validateTrezorResponse = async (trezorCardanoGetPublicKeyResp: CardanoGetPublicKey) => {
    const trezorDeviceInfo = {};
    trezorDeviceInfo.valid = false;
    trezorDeviceInfo.errorId = '';

    if(!trezorCardanoGetPublicKeyResp.success) {
      trezorDeviceInfo.errorId = trezorCardanoGetPublicKeyResp.payload.error;
    }
    
    if(!trezorDeviceInfo.errorId && trezorCardanoGetPublicKeyResp.payload.publicKey.length <= 0) {
      trezorDeviceInfo.errorId = 'UNKNOWN';
    }
    
    if(!trezorDeviceInfo.errorId && this.trezorEventDevice.payload.type != 'acquired') {
      trezorDeviceInfo.errorId = 'Error: Cant get device feartures !!';
    }
    
    if(!trezorDeviceInfo.errorId) {
      if(this.trezorEventDevice.payload.type === 'acquired') {
        trezorDeviceInfo.features = Object.assign({}, this.trezorEventDevice.payload.features);
      }
      trezorDeviceInfo.valid = true;
      trezorDeviceInfo.trezorCardanoGetPublicKeyResult = trezorCardanoGetPublicKeyResp;
    }

    this.trezorDeviceInfo = trezorDeviceInfo;
  }

  _isTrezorResponseValid() {
    return this.trezorDeviceInfo.valid;
  }    

  onSave = async () => {

    this.form.submit({
      onSuccess: async (form) => {
        this.setState({ isSubmitting: true });
        this.progressState = ProgressStateOption.SAVE_START;
        await this._updateState();

        const { walletName } = form.values();
        const walletData = {
          publicMasterKey: this.trezorDeviceInfo.trezorCardanoGetPublicKeyResult.payload.publicKey,
          walletName: walletName,
          deviceFeatures: this.trezorDeviceInfo.features
        };        
        this.props.onSubmit(walletData);
      },
      onError: () => {
        this.setState({ isSubmitting: false });
      },
    });
  }
}

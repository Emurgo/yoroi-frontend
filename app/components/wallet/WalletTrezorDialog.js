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
import SvgTrezorInit  from '../../assets/images/trezor/ada-logo.inline.svg';
import gifIcon from '../../assets/images/trezor/connecting.gif';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { isValidHardwareWalletName } from '../../utils/validations';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';
import ProgressSteps from '../widgets/ProgressSteps';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
    description: 'Label "Connect to Trezor Hardware Wallet" on the Connect to Trezor Hardware Wallet dialog.'
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

type ProgressState = 'INTRO' | 'CONNECT_LOAD' | 'CONNECT_START' | 'CONNECT_ERROR' | 'SAVE_LOAD' | 'SAVE_START' | 'SAVE_ERROR' ;
const ProgressStateOption = {
  // INTRO Page
  'INTRO': 'INTRO',
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
    this.progressState = ProgressStateOption.INTRO;
    this.state = {
      error_live_info_text : '[ ERROR or Conditional/Live Msg LINE  : ERROR or Conditional/Live text will go here ]'
    };
  }

  componentWillMount() {
    this.form = new ReactToolboxMobxForm({
      fields: {
        walletName: {
          label: this.context.intl.formatMessage(messages.walletNameInputLabel),
          placeholder: this.context.intl.formatMessage(messages.walletNameInputHint),
          value: '',
          validators: [({ field }) => (
            [
              isValidHardwareWalletName(field.value),
              this.context.intl.formatMessage(globalMessages.invalidWalletName)
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

    const progressComponent = (<div>[ OVERALL STEP PROGRESS DISPLAY LINE ] INTRO | CONNECT | SAVE</div>);
    const step1Component = (<div>[ CURRENT STEP INFO LINE ] STEP 1 : Introduction<br/>
        A hardware wallet is a small USB device that allows you to access your wallet quickly, safely & easily. It is more secure because your private key never leaves the hardware wallet. It protects you from phishing, malware, and more.<br/>
        <a href='https://blog.trezor.io/trezor-integration-with-myetherwallet-3e217a652e08#.n5fddxmdg'>How to use Yoroi with TREZOR</a><br/>
        <a href='https://trezor.io/'>Don't have a TREZOR? Get one now.</a><br/>
        </div>);
    const step2Component = (<div>[ CURRENT STEP INFO LINE ] STEP 2 : Connection Validation<br/>
    After Connecting your Trezor device to USB port please press "Connect" button.<br/>
    A new tab will appear, please perform needed action there.<br/>
    <a href='https://blog.trezor.io/trezor-integration-with-myetherwallet-3e217a652e08#.n5fddxmdg'>How to use Yoroi with TREZOR</a><br/>
    </div>);
    const step3Component = (<div>[ CURRENT STEP INFO LINE ] STEP 3 : Save the exprted public key and fetch transactions<br/>
      <a href='https://blog.trezor.io/trezor-integration-with-myetherwallet-3e217a652e08#.n5fddxmdg'>How to use Yoroi with TREZOR</a><br/>
      </div>);    

    const prerequisiteStart = (<div>[ PREREQUISITE AREA START ]</div>);
    const prerequisite1 = (<div>1. ⚪/🔵/🔴 Only Supports Trezor Model T</div>);
    const prerequisite2 = (<div>2. ⚪/🔵/🔴 Device Frimware should be greater than or equal to 2.0.8</div>);
    const prerequisite3 = (<div>3. ⚪/🔵/🔴 Device should be pre-initialized, if not then first goto https://trezor.io/start/ </div>);
    const prerequisiteEnd = (<div>[ PREREQUISITE AREA END ]</div>);
    const otherMustHaveStart = (<div>[ OTHER MUST HAVE CONDITION AREA START ] Thinking to move to INTRO step</div>);
    const mustHave1 = (<div>1. ⚪ make sure you are connected to internet throught the process</div>);
    const mustHave2 = (<div>2. ⚪ connect only one(not multiple) Trezor Model T device to computer's USB port</div>);
    const mustHave3 = (<div>3. ⚪ Trezor Model T device must be in unlocked state</div>);
    const mustHave4 = (<div>4. ⚪ do not remove the device from USB port throught the connection process</div>);
    const mustHave5 = (<div>5. ⚪ after you press 'Connect' button new tab will be open, please follow required steps there</div>);
    const otherMustHaveEnd = (<div>[ OTHER MUST HAVE CONDITION AREA END ]</div>);
    const infoImageStart = (<div>[ ANIMATION AREA START ]</div>);
    const infoImage = (<div><img src={gifIcon} alt={'TRY CONNECT ANIMATION'}/></div>);
    const infoImageEnd = (<div>[ ANIMATION AREA END ]</div>);
    const errorArea = (<div>{this.state.error_live_info_text}</div>);

    const walletName = (
      <div>Give a wallet name<br/>
      <input type="text"></input><br/>
      *Input validation, eg: name should not empty or less than X no. of chars.
      </div>
    );

    let dialog = null;

    if(this.progressState === ProgressStateOption.INTRO) {
      const progressComponentStep1 = (<div>[ OVERALL STEP PROGRESS DISPLAY LINE ] [ INTRO ] | CONNECT | SAVE</div>);
      const prerequisiteStart = (<div>[ PREREQUISITE AREA START ]</div>);
      const prerequisite1 = (<div>[ CHECK-BOX ] Only Supports Trezor Model T</div>);
      const prerequisite2 = (<div>[ CHECK-BOX ] Device Frimware should be greater than or equal to 2.0.8</div>);
      const prerequisite3 = (<div>[ CHECK-BOX ] Device should be pre-initialized, if not then first goto https://trezor.io/start/ </div>);
      const mustHave1 = (<div>[ CHECK-BOX ] make sure you are connected to internet throught the process</div>);
      const mustHave2 = (<div>[ CHECK-BOX ] connect only one(not multiple) Trezor Model T device to computer's USB port</div>);
      const mustHave3 = (<div>[ CHECK-BOX ] Trezor Model T device must be in unlocked state</div>);
      const mustHave4 = (<div>[ CHECK-BOX ] do not remove the device from USB port throught the connection process</div>);
      const mustHave5 = (<div>[ CHECK-BOX ] after you press 'Connect' button new tab will be open, please follow required steps there</div>);
      const prerequisiteEnd = (<div>[ PREREQUISITE AREA END ]</div>);
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
        <ProgressSteps
          stepsList={['INTRO', 'CONNECT', 'SAVE']}
          progressIndex={0}
        />
        {step1Component}
        <br/>
        {prerequisiteStart}
        {prerequisite1}
        {prerequisite2}
        {prerequisite3}
        {mustHave1}
        {mustHave2}
        {mustHave3}
        {mustHave4}
        {prerequisiteEnd}          
        <br/>
        {errorArea}
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_LOAD) {
      const progressComponentStep2 = (<div>[ OVERALL STEP PROGRESS DISPLAY LINE ] INTRO | [ CONNECT ] | SAVE</div>);
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
        <ProgressSteps
          stepsList={['INTRO', 'CONNECT', 'SAVE']}
          progressIndex={1}
        />
        <br/>
        {step2Component}
        <br/>
        {infoImageStart}
        {infoImage}
        {infoImageEnd}
        <br/>
        {errorArea}
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_START) {
      const progressComponentStep2 = (<div>[ OVERALL STEP PROGRESS DISPLAY LINE ] INTRO | [ CONNECT ] | SAVE</div>);
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
        <ProgressSteps
          stepsList={['INTRO', 'CONNECT', 'SAVE']}
          progressIndex={1}
        />
        <br/>
        {step2Component}
        {infoImageStart}
        {infoImage}
        {infoImageEnd}
        <br/>
        {errorArea}
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_ERROR) {
      const progressComponentStep2 = (<div>[ OVERALL STEP PROGRESS DISPLAY LINE ] INTRO | [ CONNECT ] | SAVE</div>);
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
        <ProgressSteps
          stepsList={['INTRO', 'CONNECT', 'SAVE']}
          progressIndex={1}
        />
        <br/>
        {step2Component}
        <br/>
        {infoImageStart}
        {infoImage}
        {infoImageEnd}
        <br/>
        {errorArea}
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_LOAD) {
      const progressComponentStep3 = (<div>[ OVERALL STEP PROGRESS DISPLAY LINE ] INTRO | CONNECT | [ SAVE ] </div>);
      const actions = [{
        className: this.state.action_btn_processing ? styles.isSubmitting : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onSave
      }];

      const walletNameFieldClasses = classnames([
        'walletName',
        styles.walletName,
      ]);
      const walletNameField = this.form.$('walletName');      

      dialog = (
        <Dialog
          className={dialogClasses}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        <ProgressSteps
          stepsList={['INTRO', 'CONNECT', 'SAVE']}
          progressIndex={2}
        />
        <br/>
        {step3Component}
        <br/>

        <Input
          className={walletNameFieldClasses}
          {...walletNameField.bind()}
          error={walletNameField.error}
          skin={<SimpleInputSkin />}
        />

        <br/>
        {infoImageStart}
        {infoImage}
        {infoImageEnd}
        <br/>
        {errorArea}
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_START) {
      const progressComponentStep3 = (<div>[ OVERALL STEP PROGRESS DISPLAY LINE ] INTRO | CONNECT | [ SAVE ] </div>);
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
        <ProgressSteps
          stepsList={['INTRO', 'CONNECT', 'SAVE']}
          progressIndex={2}
        />
        <br/>
        {step3Component}
        <br/>
        {walletName}
        <br/>
        {infoImageStart}
        {infoImage}
        {infoImageEnd}
        <br/>
        {errorArea}
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_ERROR) {
      const progressComponentStep3 = (<div>[ OVERALL STEP PROGRESS DISPLAY LINE ] INTRO | CONNECT | [ SAVE ] </div>);
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
        <ProgressSteps
          stepsList={['INTRO', 'CONNECT', 'SAVE']}
          progressIndex={2}
        />
        <br/>
        {step3Component}
        <br/>
        {prerequisiteStart}
        {prerequisite1}
        {prerequisite2}
        {prerequisite3}
        {prerequisiteEnd}          
        <br/>
        {otherMustHaveStart}
        {mustHave1}
        {mustHave2}
        {mustHave3}
        {mustHave4}
        {otherMustHaveEnd}
        <br/>
        {infoImageStart}
        {infoImage}
        {infoImageEnd}
        <br/>
        {errorArea}
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
      case ProgressStateOption.INTRO:
        this.state.action_btn_processing = false;
        this.state.action_btn_name = 'Next';
        this.state.error_live_info_text = 'Please check prerequisite and press "Next" button';
        break;      
      case ProgressStateOption.CONNECT_LOAD:
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        this.state.error_live_info_text = 'Please press "Connect" button when ready';
        break;
      case ProgressStateOption.CONNECT_START:
        this.state.action_btn_processing = true;
        this.state.error_live_info_text = 'Checking Trezor connection, please follow steps on new opened Tab...'
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        break;
      case ProgressStateOption.CONNECT_ERROR:
        this.state.action_btn_processing = false;
        this.state.error_live_info_text = this.trezorDeviceInfo.errorId;
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        break;        
      case ProgressStateOption.SAVE_LOAD:
        this.state.action_btn_processing = false;
        this.form.$('walletName').value = this.trezorDeviceInfo.features.label;
        this.state.error_live_info_text = 'SAVE_LOAD State';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;
       case ProgressStateOption.SAVE_START:
        this.state.action_btn_processing = true;
        this.state.error_live_info_text = 'SAVE_START State';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;
      case ProgressStateOption.SAVE_ERROR:
        this.state.action_btn_processing = false;
        this.state.error_live_info_text = 'SAVE_ERROR State';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;                       
      default:
        console.error(`ERROR STATE, HANDLE UPDATE-PROGRESS: ${this.progressState}`);
        break;
    }
    this.setState({});
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

    trezorDeviceInfo.trezorCardanoGetPublicKeyResult = trezorCardanoGetPublicKeyResp;
    if(this.trezorEventDevice.payload.type === 'acquired') {
      trezorDeviceInfo.features = Object.assign({}, this.trezorEventDevice.payload.features);
    } else {
      trezorDeviceInfo.errorId = 'Error: Cant get device feartures !!';
    }

    if(!trezorDeviceInfo.errorId) {
      if(trezorCardanoGetPublicKeyResp.payload.publicKey.length > 0) {
          trezorDeviceInfo.valid = true;
      } else {
        trezorDeviceInfo.errorId = 'UNKNOWN';
        if(trezorCardanoGetPublicKeyResp.payload && trezorCardanoGetPublicKeyResp.payload.error) {
          trezorDeviceInfo.errorId = trezorCardanoGetPublicKeyResp.payload.error;
        }
      }
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

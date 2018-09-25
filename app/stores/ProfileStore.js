// @flow
import { observable, computed } from 'mobx';
import BigNumber from 'bignumber.js';
import moment from 'moment/moment';
import Store from './lib/Store';
import Request from './lib/LocalizedRequest';
import environment from '../environment';
import { ROUTES } from '../routes-config';
import globalMessages from '../i18n/global-messages';

export default class SettingsStore extends Store {

  LANGUAGE_OPTIONS = [
    { value: 'en-US', label: globalMessages.languageEnglish },
    { value: 'ja-JP', label: globalMessages.languageJapanese },
    { value: 'ko-KR', label: globalMessages.languageKorean },
    { value: 'zh-Hans', label: globalMessages.languageChineseSimplified },
    { value: 'zh-Hant', label: globalMessages.languageChineseTraditional },
  ];

  @observable bigNumberDecimalFormat = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0
  };

  /* eslint-disable max-len */
  @observable getProfileLocaleRequest: Request<string> = new Request(this.api.localStorage.getUserLocale);
  @observable setProfileLocaleRequest: Request<string> = new Request(this.api.localStorage.setUserLocale);
  @observable getTermsOfUseAcceptanceRequest: Request<string> = new Request(this.api.localStorage.getTermsOfUseAcceptance);
  @observable setTermsOfUseAcceptanceRequest: Request<string> = new Request(this.api.localStorage.setTermsOfUseAcceptance);
  @observable getSendLogsChoiceRequest: Request<boolean> = new Request(this.api.localStorage.getSendLogsChoice);
  @observable setSendLogsChoiceRequest: Request = new Request(this.api.localStorage.setSendLogsChoice);
  /* eslint-enable max-len */

  setup() {
    this.actions.profile.updateLocale.listen(this._updateLocale);
    this.actions.profile.acceptTermsOfUse.listen(this._acceptTermsOfUse);
    // this.actions.profile.resetBugReportDialog.listen(this._resetBugReportDialog);
    // this.actions.profile.sendBugReport.listen(this._sendBugReport);
    this.registerReactions([
      this._setBigNumberFormat,
      this._updateMomentJsLocaleAfterLocaleChange,
      this._reloadAboutWindowOnLocaleChange,
      this._redirectToLanguageSelectionIfNoLocaleSet,
      this._redirectToTermsOfUseScreenIfTermsNotAccepted,
      this._redirectToSendLogsChoiceScreenIfSendLogsChoiceNotSet,
      this._redirectToMainUiAfterTermsAreAccepted,
    ]);
    this._getTermsOfUseAcceptance();
  }

  teardown() {
    super.teardown();
  }

  _setBigNumberFormat = () => {
    BigNumber.config({ FORMAT: this.bigNumberDecimalFormat });
  };

  @computed get currentLocale(): string {
    const { result } = this.getProfileLocaleRequest.execute();
    if (this.isCurrentLocaleSet) return result;
    return 'en-US'; // default
  }

  @computed get hasLoadedCurrentLocale(): boolean {
    return (
      this.getProfileLocaleRequest.wasExecuted && this.getProfileLocaleRequest.result !== null
    );
  }

  @computed get isCurrentLocaleSet(): boolean {
    return (this.getProfileLocaleRequest.result !== null && this.getProfileLocaleRequest.result !== '');
  }

  @computed get termsOfUse(): string {
    const network = environment.isMainnet() ? 'mainnet' : 'other';
    return require(`../i18n/locales/terms-of-use/${environment.API}/${network}/${this.currentLocale}.md`);
  }

  @computed get hasLoadedTermsOfUseAcceptance(): boolean {
    return (
      this.getTermsOfUseAcceptanceRequest.wasExecuted &&
      this.getTermsOfUseAcceptanceRequest.result !== null
    );
  }

  @computed get areTermsOfUseAccepted(): boolean {
    return this.getTermsOfUseAcceptanceRequest.result === true;
  }

  @computed get isSendLogsChoiceSet(): boolean {
    return this.getSendLogsChoiceRequest.result !== null;
  }

  @computed get hasLoadedSendLogsChoice(): boolean {
    return this.getSendLogsChoiceRequest.wasExecuted;
  }

  _updateLocale = async ({ locale }: { locale: string }) => {
    await this.setProfileLocaleRequest.execute(locale);
    await this.getProfileLocaleRequest.execute();
  };

  _updateMomentJsLocaleAfterLocaleChange = () => {
    moment.locale(this.currentLocale);
  };

  _acceptTermsOfUse = async () => {
    await this.setTermsOfUseAcceptanceRequest.execute();
    await this.getTermsOfUseAcceptanceRequest.execute();
  };

  _getTermsOfUseAcceptance = () => {
    this.getTermsOfUseAcceptanceRequest.execute();
  };

  _redirectToLanguageSelectionIfNoLocaleSet = () => {
    const { isLoading } = this.stores.loading;
    if (!isLoading && this.hasLoadedCurrentLocale && !this.isCurrentLocaleSet) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.PROFILE.LANGUAGE_SELECTION });
    }
  };

  _redirectToTermsOfUseScreenIfTermsNotAccepted = () => {
    if (this.isCurrentLocaleSet &&
      this.hasLoadedTermsOfUseAcceptance && !this.areTermsOfUseAccepted) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.PROFILE.TERMS_OF_USE });
    }
  };

  _redirectToSendLogsChoiceScreenIfSendLogsChoiceNotSet = () => {
    if (this.isCurrentLocaleSet && this.areTermsOfUseAccepted &&
      this.hasLoadedSendLogsChoice && !this.isSendLogsChoiceSet) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.PROFILE.SEND_LOGS });
    }
  };

  _redirectToRoot = () => {
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
  };

  _reloadAboutWindowOnLocaleChange = () => {
    // register mobx observer for currentLocale in order to trigger reaction on change
    this.currentLocale; // eslint-disable-line
  };

  _isOnTermsOfUsePage = () => this.stores.app.currentRoute === ROUTES.PROFILE.TERMS_OF_USE;

  _redirectToMainUiAfterTermsAreAccepted = () => {
    if (this.areTermsOfUseAccepted && this._isOnTermsOfUsePage()) {
      this._redirectToRoot();
    }
  };

  /*
  FIXME: We will include bug report but not now
  _resetBugReportDialog = () => {
    // if logs are compressed then perform delete on dialog close
    if (size(this.compressedLog) > 0) {
      this._deleteCompressedFiles(this.compressedLog);
    }
    this._reset();
    this.actions.dialogs.closeActiveDialog.trigger();
  }

  _sendBugReport = action(({ email, subject, problem, compressedLog } : {
    email: string,
    subject: ?string,
    problem: ?string,
    compressedLog: ?string,
  }) => {
    this.sendBugReport.execute({
      email, subject, problem, compressedLog,
    })
      .then(action(() => {
        this._deleteCompressedFiles();
        this._reset();
        this.actions.dialogs.closeActiveDialog.trigger();
      }))
      .catch(action((error) => {
        this.error = error;
      }));
  });*/
}

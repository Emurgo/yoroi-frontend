// @flow
import React, { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import classnames from 'classnames';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { intlShape } from 'react-intl';
import BorderedBox from '../widgets/BorderedBox';
import globalMessages from '../../i18n/global-messages';
import styles from './TransferMnemonicPage.scss';
import MnemonicWidget from '../widgets/MnemonicWidget';

type Props = {|
  onSubmit: { recoveryPhrase: string } => void,
  onBack: void => void,
  mnemonicValidator: string => boolean,
  validWords: Array<string>,
  step0: string,
  mnemonicLength: number,
  classicTheme: boolean
|};

@observer
export default class TransferMnemonicPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  @observable mnemonicForm: void | ReactToolboxMobxForm;

  @action
  setMnemonicFrom(form: ReactToolboxMobxForm) {
    this.mnemonicForm = form;
  }

  submit = () => {
    if (this.mnemonicForm == null) {
      throw new Error('TransferMnemonicPage form not set');
    }
    this.mnemonicForm.submit({
      onSuccess: (form) => {
        const { recoveryPhrase } = form.values();
        const payload = {
          recoveryPhrase: join(recoveryPhrase, ' '),
        };
        this.props.onSubmit(payload);
      },
      onError: () => {}
    });
  };

  render() {
    const { intl } = this.context;
    const {
      onBack,
      step0,
      classicTheme
    } = this.props;

    const nextButtonClasses = classnames([
      'proceedTransferButtonClasses',
      'primary',
      styles.button,
    ]);
    const backButtonClasses = classnames([
      'backTransferButtonClasses',
      classicTheme ? 'flat' : 'outlined',
      styles.button,
    ]);

    return (
      <div className={styles.component}>
        <BorderedBox>

          <div className={styles.body}>

            { /* Instructions for how to transfer */ }
            <div>
              <div className={styles.title}>
                {intl.formatMessage(globalMessages.instructionTitle)}
              </div>

              <ul className={styles.instructionsList}>
                <div className={styles.text}>
                  {step0}
                  &nbsp;
                  {intl.formatMessage(globalMessages.step1)}
                </div>
              </ul>
            </div>

            <MnemonicWidget
              setForm={(form) => this.setMnemonicFrom(form)}
              mnemonicValidator={this.props.mnemonicValidator}
              validWords={this.props.validWords}
              mnemonicLength={this.props.mnemonicLength}
              classicTheme={this.props.classicTheme}
            />

            <div className={styles.buttonsWrapper}>
              <Button
                className={nextButtonClasses}
                label={intl.formatMessage(globalMessages.nextButtonLabel)}
                onClick={this.submit}
                skin={ButtonSkin}
              />

              <Button
                className={backButtonClasses}
                label={intl.formatMessage(globalMessages.backButtonLabel)}
                onClick={onBack}
                skin={ButtonSkin}
              />
            </div>

          </div>

        </BorderedBox>

      </div>
    );
  }
}

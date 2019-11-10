// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { intlShape } from 'react-intl';
import BorderedBox from '../widgets/BorderedBox';
import globalMessages from '../../i18n/global-messages';
import styles from './BaseTransferPage.scss';

type Props = {|
  children: Node,
  onSubmit: void => Promise<void>,
  onBack: void => void,
  step0: string,
  classicTheme: boolean,
  isDisabled: boolean
|};

@observer
export default class BaseTransferPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
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

            {this.props.children}

            <div className={styles.buttonsWrapper}>
              <Button
                className={nextButtonClasses}
                label={intl.formatMessage(globalMessages.nextButtonLabel)}
                onClick={this.props.onSubmit}
                skin={ButtonSkin}
                disabled={this.props.isDisabled}
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

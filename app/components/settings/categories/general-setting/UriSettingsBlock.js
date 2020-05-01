// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { intlShape } from 'react-intl';
import styles from './UriSettingsBlock.scss';
import globalMessages from '../../../../i18n/global-messages';
import { observable, runInAction } from 'mobx';

type Props = {|
  +registerUriScheme: void => void,
  +isFirefox: boolean,
|};

@observer
export default class UriSettingsBlock extends Component<Props> {

  @observable hasPressed: boolean = false;

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const allowButtonClasses = classnames([
      'allowButton',
      'primary',
      styles.submitButton,
    ]);

    // On firefox since there is no prompt,
    // We need to give the user feedback that they pressed the button
    const isDisabled = this.props.isFirefox && this.hasPressed;

    return (
      <div className={styles.component}>

        <h2 className={styles.title}>
          {intl.formatMessage(globalMessages.uriSchemeLabel)}
        </h2>

        <p>
          {intl.formatMessage(globalMessages.uriExplanation)}
        </p>

        <Button
          className={allowButtonClasses}
          label={intl.formatMessage(globalMessages.allowLabel)}
          onMouseUp={() => {
            this.props.registerUriScheme();
            runInAction(() => {
              this.hasPressed = true;
            });
          }}
          disabled={isDisabled}
          skin={ButtonSkin}
        />
      </div>
    );
  }

}

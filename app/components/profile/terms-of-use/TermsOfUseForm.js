// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import LocalizableError from '../../../i18n/LocalizableError';
import TermsOfUseText from './TermsOfUseText';
import styles from './TermsOfUseForm.scss';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  checkboxLabel: {
    id: 'profile.termsOfUse.checkboxLabel',
    defaultMessage: '!!!I agree with the terms of use',
  },
});

type Props = {|
  +localizedTermsOfUse: string,
  +onSubmit: void => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

type State = {
  areTermsOfUseAccepted: boolean,
};

@observer
export default class TermsOfUseForm extends Component<Props, State> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    areTermsOfUseAccepted: false,
  };

  toggleAcceptance() {
    this.setState(prevState => ({ areTermsOfUseAccepted: !prevState.areTermsOfUseAccepted }));
  }

  render() {
    const { intl } = this.context;
    const { isSubmitting, error, localizedTermsOfUse } = this.props;
    const { areTermsOfUseAccepted } = this.state;

    const buttonClasses = classnames([
      'primary',
      isSubmitting ? styles.submitButtonSpinning : styles.submitButton,
    ]);

    const checkboxLabel = 'checkboxLabel';
    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>

          <TermsOfUseText localizedTermsOfUse={localizedTermsOfUse} fixedHeight />

          <div className={styles.checkbox}>
            <Checkbox
              label={intl.formatMessage(messages[checkboxLabel])}
              onChange={this.toggleAcceptance.bind(this)}
              checked={areTermsOfUseAccepted}
              skin={CheckboxSkin}
            />

            <Button
              className={buttonClasses}
              label={intl.formatMessage(globalMessages.continue)}
              onMouseUp={this.props.onSubmit}
              disabled={!areTermsOfUseAccepted}
              skin={ButtonSkin}
            />
          </div>

          {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
        </div>
      </div>
    );
  }

}

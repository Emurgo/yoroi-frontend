// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import LocalizableError from '../../../i18n/LocalizableError';
import TermsOfUseText from './TermsOfUseText';
import PrivacyPolicy from './PrivacyPolicy';
import styles from './TermsOfUseForm.scss';
import CenteredBarDecoration from '../../widgets/CenteredBarDecoration';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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

type State = {|
  areTermsOfUseAccepted: boolean,
|};

@observer
export default class TermsOfUseForm extends Component<Props, State> {
  static defaultProps: {|error: void|} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    areTermsOfUseAccepted: false,
  };

  toggleAcceptance() {
    this.setState(prevState => ({ areTermsOfUseAccepted: !prevState.areTermsOfUseAccepted }));
  }

  render(): Node {
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
          <PrivacyPolicy />
          <div className={styles.centerBar}>
            <CenteredBarDecoration />
          </div>
          <TermsOfUseText localizedTermsOfUse={localizedTermsOfUse} fixedHeight />

          <div className={styles.checkbox}>
            <Checkbox
              label={intl.formatMessage(messages[checkboxLabel])}
              onChange={this.toggleAcceptance.bind(this)}
              checked={areTermsOfUseAccepted || this.props.isSubmitting}
              skin={CheckboxSkin}
            />

            <Button
              className={buttonClasses}
              label={intl.formatMessage(globalMessages.continue)}
              onMouseUp={this.props.onSubmit}
              disabled={!areTermsOfUseAccepted || this.props.isSubmitting}
              skin={ButtonSkin}
            />
          </div>

          {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
        </div>
      </div>
    );
  }
}

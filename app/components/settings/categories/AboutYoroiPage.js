import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './GeneralSettings.scss';
import GeneralSettingsFooter from '../../../containers/footer/GeneralSettingsFooter';
import { observer } from 'mobx-react';
import classNames from 'classnames';

const messages = defineMessages({
  aboutYoroiLabel: {
    id: 'settings.general.aboutYoroi.label',
    defaultMessage: '!!!About Yoroi',
    description: 'Label for the About Yoroi section.'
  },

});

type Props = {
  currentLocale: string,
};

@observer
export default class GeneralSettings extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const componentClassNames = classNames([styles.component, 'general']);

    return (
      <div className={componentClassNames}>
        <h1>{intl.formatMessage(messages.aboutYoroiLabel)}</h1>

        <GeneralSettingsFooter />
      </div>

    );

  }


}

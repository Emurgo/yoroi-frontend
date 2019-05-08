// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TermsOfUseText from '../../profile/terms-of-use/TermsOfUseText';
import styles from './TermsOfUseSettings.scss';
import type { Theme } from '../../../themes';

type Props = {
  localizedTermsOfUse: string,
  currentTheme: Theme,
};

@observer
export default class TermsOfUseSettings extends Component<Props> {
  render() {
    const { localizedTermsOfUse, currentTheme } = this.props;
    return (
      <div className={styles.component}>
        <TermsOfUseText localizedTermsOfUse={localizedTermsOfUse} currentTheme={currentTheme} />
      </div>
    );
  }

}

// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import globalMessages from '../../../i18n/global-messages';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import editSvg from '../../../assets/images/edit.inline.svg';
import styles from './ReadOnlyInput.scss';

type Props = {
  label: string,
  value: string,
  isSet: boolean,
  onClick: Function,
  isClassicThemeActive: boolean,
};

@observer
export default class ReadOnlyInput extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      label,
      value,
      isSet,
      onClick,
      isClassicThemeActive,
    } = this.props;
    const { intl } = this.context;
    const buttonLabel = intl.formatMessage(globalMessages[isSet ? 'change' : 'create']);

    const mainClasses = classnames([
      isClassicThemeActive ? styles.componentClassic : styles.component,
      isSet ? 'changeLabel' : 'createLabel',
    ]);

    return (
      <div className={mainClasses}>

        <Input
          themeOverrides={styles}
          type="text"
          label={label}
          value={value}
          disabled
          skin={isClassicThemeActive ? InputSkin : InputOwnSkin}
        />

        <button
          type="button"
          className={styles.button}
          onClick={onClick}
        >
          {isClassicThemeActive ? buttonLabel : <SvgInline svg={editSvg} className={styles.icon} />}
        </button>

      </div>
    );
  }

}

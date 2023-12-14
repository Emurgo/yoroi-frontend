// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import TextField from '../../common/TextField';
import globalMessages from '../../../i18n/global-messages';
import { ReactComponent as EditSvg }  from '../../../assets/images/edit.inline.svg';
import styles from './ReadOnlyInput.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +label: string,
  +value: string,
  +isSet: boolean,
  +onClick: void => void,
  +classicTheme: boolean,
|};

@observer
export default class ReadOnlyInput extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      label,
      value,
      isSet,
      onClick,
      classicTheme,
    } = this.props;
    const { intl } = this.context;
    const buttonLabel = intl.formatMessage(isSet ? globalMessages.change : globalMessages.create);

    const mainClasses = classnames([
      styles.component,
      isSet ? 'changeLabel' : 'createLabel',
    ]);

    return (
      <div className={mainClasses}>

        <TextField
          type="text"
          label={label}
          value={value}
          disabled
        />

        <button
          type="button"
          className={styles.button}
          onClick={onClick}
        >
          {classicTheme ? buttonLabel : <span className={styles.icon}><EditSvg /></span>}
        </button>

      </div>
    );
  }

}

// @flow
import { Component } from 'react';
import type { Node } from 'react';
import type { MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SideBarCategory.scss';

type Props = {|
  +icon: string,
  +active: boolean,
  +onClick: void => void,
  +showLabel?: boolean,
  +label: ?MessageDescriptor,
|};

@observer
export default class SideBarCategory extends Component<Props> {
  static defaultProps: {|showLabel: boolean|} = {
    showLabel: false,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {

    const { intl } = this.context;

    const {
      icon,
      active,
      onClick,
      label,
      showLabel
    } = this.props;

    const componentStyles = classNames([
      styles.component,
      active ? styles.active : null,
    ]);

    const SvgElem = icon;

    return (
      <button
        type="button"
        className={componentStyles}
        onClick={onClick}
        disabled={active}
      >
        <span className={styles.icon}><SvgElem /></span>
        {label != null && showLabel === true && (
          <span className={styles.label}>{intl.formatMessage(label)}</span>
        )}
      </button>
    );
  }

}

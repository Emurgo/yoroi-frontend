// @flow
import { Component } from 'react';
import type { Node } from 'react';
import type { MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SideBarCategoryRevamp.scss';

type Props = {|
  +icon: string,
  +active: boolean,
  +route: string,
  +onClick: void => void,
  +label: ?MessageDescriptor,
|};

@observer
export default class SideBarCategoryRevamp extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const { icon, active, onClick, label, route } = this.props;

    const componentStyles = classNames([styles.component, active ? styles.active : null]);

    const SvgElem = icon;
    const isInternalLink = route.startsWith('/') || route.startsWith('#');

    return isInternalLink ? (
      <button
        type="button"
        className={componentStyles}
        // $FlowExpectedError[incompatible-use]
        id={label.id}
        onClick={onClick}
        disabled={active}
      >
        <span className={styles.icon}>
          <SvgElem />
        </span>
        {label ? <span className={styles.label}>{intl.formatMessage(label)}</span> : null}
      </button>
    ) : (
      <a
        href={route}
        className={componentStyles}
        // $FlowExpectedError[incompatible-use]
        id={label.id}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={styles.icon}>
          <SvgElem />
        </span>
        {label ? <span>{intl.formatMessage(label)}</span> : null}
      </a>
    );
  }
}

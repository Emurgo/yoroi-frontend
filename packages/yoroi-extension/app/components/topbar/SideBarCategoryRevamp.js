// @flow
import { Component } from 'react';
import type { Node } from 'react';
import type { MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SideBarCategoryRevamp.scss';
import { Typography } from '@mui/material';

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
        {label ? (
          <Typography variant="caption2" className={styles.label}>
            {intl.formatMessage(label)}
          </Typography>
        ) : null}
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
        {label ? <Typography variant="caption2">{intl.formatMessage(label)}</Typography> : null}
      </a>
    );
  }
}

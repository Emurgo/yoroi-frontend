// @flow //
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import styles from './Maintenance.scss';

type Props = {|
|};

@observer
export default class Maintenance extends Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  root: ?HTMLElement;

  render() {
    const textComp = (
      <div className={styles.text}>
        Under maintenance. Check for version update.
      </div>);

    return (
      <div className={styles.component}>
        <div className={styles.wrapper} />
        {textComp}
      </div>
    );
  }
}

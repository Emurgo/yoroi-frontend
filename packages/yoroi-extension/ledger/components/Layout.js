// @flow //
import React from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

import type { TransportIdType } from '../types/enum';
import type {
  setTransportFunc,
  setLocaleFunc,
} from '../types/func';
import TestBlock from './manual-test/TestBlock';
import Footer from './footer/Footer';

import styles from './Layout.scss';

type Props = {|
  setTransport: setTransportFunc,
  setLocale: setLocaleFunc,
  currentLocale: string,
  isDevelopment: boolean,
  appVersion: string,
  transportId: TransportIdType,
  children: Node,
|};

@observer
export default class Layout extends React.Component<Props> {
  render(): Node {
    const {
      setTransport,
      setLocale,
      isDevelopment,
      appVersion,
      transportId,
      currentLocale,
      children,
    } = this.props;

    return (
      <div className={styles.component}>
        {/* TestBlock will only be visible in Development mode */}
        {false && isDevelopment && (
          <TestBlock
            setTransport={setTransport}
            currentTransportId={transportId}
            setLocale={setLocale}
            currentLocale={currentLocale}
          />
        )}
        {/* Development mode block end */}

        {children}
        <Footer
          appVersion={appVersion}
          transportId={transportId}
        />
      </div>
    );
  }
}

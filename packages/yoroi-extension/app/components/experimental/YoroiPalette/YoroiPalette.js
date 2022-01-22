// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './YoroiPalette.scss'
import type { Node } from 'react';
import { classicTheme } from '../../../styles/themes/classic-theme'
import { getPalette } from './palette';

type Props = {|
    header: string,
|}

/**
 * Display shadows
 */

@observer
export default class YoroiPalettePage extends Component<Props> {

    render(): Node {
        const palette = getPalette(classicTheme)
        return (
          <div className={styles.component}>
            {Object.entries(palette).map((row) => (
              <div className={styles.row} key={row[1]}>
                <span
                  className={styles.colorBox}
                  style={{
                      backgroundColor: row[1]
                  }}
                />
                <p className={styles.colorHex}>
                  {row[1]}
                </p>
                <p className={styles.colorName}>{row[0]}</p>
              </div>
              ))}
          </div>
        )
    }
}
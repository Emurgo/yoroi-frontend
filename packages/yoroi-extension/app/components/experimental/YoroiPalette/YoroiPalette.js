// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './YoroiPalette.scss'
import type { Node } from 'react';
import { classicTheme } from '../../../styles/themes/classic-theme'
import {  modernTheme } from '../../../styles/themes/modern-theme'
import classNames from 'classnames';
import { getPalette } from './palette';

type Props = {|
    header: string,
|}

/**
 * @todos
 * 1. Display shadows
 * 2. Display All colors
 * 3. Toggle according to the theme
 *
 */

const themes = {
    classic: classicTheme,
    modern: modernTheme
}

@observer
export default class YoroiPalettePage extends Component<Props> {

    state = {
        currentTheme: 'classic',
    }


    render(): Node {
        const { currentTheme } = this.state
        const palette = getPalette(themes[currentTheme])

        return (
          <div className={styles.component}>
            <div className={styles.themes}>
              <button className={classNames([(currentTheme === 'classic') && styles.active])} type='button'>Classic Theme</button>
              <button className={classNames([(currentTheme === 'modern') && styles.active])} type='button'>Modern Theme</button>
            </div>

            <div className={styles.row}>
              <p>Color</p>
              <p className={styles.colorHex}>
                Color Value
              </p>
              <p className={styles.colorName}>Name in code</p>

            </div>
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
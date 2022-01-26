// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './YoroiPalette.scss'
import type { Node } from 'react';
import { classicTheme } from '../../../styles/themes/classic-theme'
import {  modernTheme } from '../../../styles/themes/modern-theme'
import classNames from 'classnames';
import { getPalette } from './palette';

type Props = {||}

type Theme = 'classic' | 'modern'

type State = {|
  currentTheme: Theme
|}

/**
 * @todos Only accessable in nightly
 */

const themes = {
    classic: classicTheme,
    modern: modernTheme
}

@observer
export default class YoroiPalettePage extends Component<Props, State> {

    state: State = {
        currentTheme: 'classic',
    }

    switchTheme(theme: Theme): void {
        this.setState({ currentTheme: theme })
    }

    render(): Node {
        const { currentTheme } = this.state
        const palette = getPalette(themes[currentTheme])
        return (
          <div className={styles.component}>
            <div className={styles.themes}>
              <button
                className={classNames([(currentTheme === 'classic') && styles.active])}
                type='button'
                onClick={() => this.switchTheme('classic')}
              >
                Classic Theme
              </button>
              <button
                onClick={() => this.switchTheme('modern')}
                className={classNames([(currentTheme === 'modern') && styles.active])}
                type='button'
              >
                Modern Theme
              </button>
            </div>
            {Object.entries(palette).map((row, idx) => (
              <div className={styles.row} key={idx}>
                <span
                  className={styles.colorBox}
                  style={{
                      backgroundColor: row[1]
                  }}
                />
                <p className={styles.colorHex}>
                  {JSON.stringify(row[1])}
                </p>
                <p className={styles.colorName}>{row[0]}</p>
              </div>
              ))}
          </div>
        )
    }
}
// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './YoroiThemesPage.scss'
import type { Node } from 'react';
import { classicTheme } from '../../../styles/themes/classic-theme'
import {  modernTheme } from '../../../styles/themes/modern-theme'
import classNames from 'classnames';

type Props = {|
    header: string,
|}

/**
 * @todos
 * 1. Display shadows
 * 2. Display All colors
 * 3. Toggle according to the theme
 * 4. Only accessable in nightly
 */

const themes = {
    classic: classicTheme,
    modern: modernTheme
}

@observer
export default class YoroiThemesPage extends Component<Props> {

    state = {
        currentTheme: 'classic',
    }

    switchTheme(theme: string): void {
        this.setState({ currentTheme: theme })
    }

    render(): Node {
        const { currentTheme } = this.state
        console.log(themes)
        console.log(Object.entries(themes[currentTheme].typography))
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
            <div className={styles.shadows}>
              <h1>Shadows</h1>
              <div className={styles.shadowsContainer}>
                {themes[currentTheme].shadows.map(shadow => (
                  <div
                    className={styles.shadow}
                    style={{
                    boxShadow: shadow
                  }}
                    key={shadow}
                  >{shadow}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h1>Typography</h1>
              <div>
                {Object.entries(themes[currentTheme].typography).map(entry => {
                  if (typeof entry[1] === 'object') {
                    return (
                      <div key={entry[0]}>
                        <p>{entry[0]}</p>
                        <ul>
                          {Object.entries(entry[1]).map(row => (
                            <li key={row[0]}>
                              <p>{row[0]}</p>
                              <p>{row[1]}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                  )
                }
              })}
              </div>
            </div>
          </div>
        )
    }
}
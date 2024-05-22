// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './YoroiThemesPage.scss'
import type { Node } from 'react';
import { classicTheme } from '../../../styles/themes/classic-theme'
import {  modernTheme } from '../../../styles/themes/modern-theme'
import classNames from 'classnames';

type Props = {||}
type Theme = 'classic' | 'modern'

type State = {|
  currentTheme: Theme
|}

const themes = {
    classic: classicTheme,
    modern: modernTheme
}

@observer
export default class YoroiThemesPage extends Component<Props, State> {

    state: State = {
        currentTheme: 'classic',
    }

    switchTheme(theme: Theme): void {
        this.setState({ currentTheme: theme })
    }

    render(): Node {
        const { currentTheme } = this.state
        delete themes[currentTheme].components
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
            <div className={styles.typographyWrapper}>
              <h1>Typography</h1>
              <div className={styles.typographyList}>
                {Object.entries(themes[currentTheme].typography).map(entry => {
                  if (typeof entry[1] === 'object') {
                    return (
                      <div className={styles.row} key={entry[0]}>
                        <div className={styles.rowKey}>{entry[0]}</div>
                        <ul className={styles.subRow}>
                          {Object.entries(Object(entry[1])).map(row => (
                            <li className={styles.subRowItem} key={row[0]}>
                              <div className={styles.key}>{JSON.stringify(row[0])}</div>
                              <div className={styles.value}>{JSON.stringify(row[1])}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                  )
                }

                return ''
              })}
              </div>
            </div>

            <div className={styles.jsonWrapper}>
              <h1>Show All ({currentTheme})</h1>
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
              <div className={styles.json}>
                <pre>{JSON.stringify(themes[currentTheme], null, 5)}</pre>
              </div>
            </div>
          </div>
        )
    }
}
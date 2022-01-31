// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './YoroiPalette.scss'
import type { Node } from 'react';
import { classicTheme } from '../../../styles/themes/classic-theme'
import {  modernTheme } from '../../../styles/themes/modern-theme'
import classNames from 'classnames';
import { formatPalette, getPalette } from './palette';
import ArrowDown from '../../../assets/images/my-wallets/arrow_down.inline.svg';

/**
 * @todos
 * 1. Print transaction status
 * 2. Print the actual theme object
 */
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
      const { multiLayerColor, nameToHex } = formatPalette(palette, themes[currentTheme])
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

          <div className={styles.multiLayer}>
            <h1>Design tokens</h1>
            <div className={styles.multiLayerRows}>
              {
                multiLayerColor.map(color => (
                  <ul className={styles.multiLayerRow}>
                    <li className={classNames([styles.flexWithMargin, styles.multiLayerColorHex])}>
                      <div
                        style={{
                        backgroundColor: color.hex,
                        width: '20px',
                        height: '20px',
                        borderRadius: '3px',
                        border: '1px solid var(--yoroi-palette-gray-200)',
                      }}
                      />
                      <p>{color.hex}</p>
                    </li>
                    <li className={styles.arrowDown}><ArrowDown /></li>
                    <li className={classNames([styles.flexWithMargin, styles.child])}>
                      <div
                        style={{
                        backgroundColor: color.hex,
                        width: '20px',
                        height: '20px',
                        borderRadius: '3px',
                        border: '1px solid var(--yoroi-palette-gray-200)',
                      }}
                      />
                      <p>{color.child}</p>
                    </li>
                    <li className={styles.arrowDown}><ArrowDown /></li>
                    <li className={classNames([styles.flexWithMargin, styles.parent])}>
                      <div
                        style={{
                        backgroundColor: color.hex,
                        width: '20px',
                        height: '20px',
                        borderRadius: '3px',
                        border: '1px solid var(--yoroi-palette-gray-200)',
                      }}
                      />
                      <p>{color.parent}</p>
                    </li>
                  </ul>
                ))
              }
            </div>
          </div>
          {nameToHex.map((color, idx) => (
            <div className={styles.row} key={idx}>
              <span
                className={styles.colorBox}
                style={{
                    backgroundColor: color.hex
                }}
              />
              <p className={styles.colorHex}>
                {String(color.hex)}
              </p>
              <p className={styles.colorName}>{color.name}</p>
            </div>
            ))}
        </div>
      )
  }
}
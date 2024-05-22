// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './YoroiPalette.scss'
import type { Node } from 'react';
import { classicTheme } from '../../../styles/themes/classic-theme'
import {  modernTheme } from '../../../styles/themes/modern-theme'
import classNames from 'classnames';
import { ReactComponent as ArrowDown }  from '../../../assets/images/down-arrow.inline.svg';
import { getMainYoroiPalette, formatPalette } from '../../../styles/globalStyles';
import type { DesignToken } from '../../../styles/globalStyles'

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
      const palette = getMainYoroiPalette(themes[currentTheme])
      const { designTokens, nameToHex } = formatPalette(palette, themes[currentTheme])
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
                designTokens.map(color => (
                  <ul className={styles.multiLayerRow}>
                    {this.renderRow(color).map(node => node)}
                  </ul>
                ))
              }
            </div>
          </div>

          <h1 className={styles.nameToHexHeader}>Colors Direct Hex Colors</h1>
          {nameToHex.map((color) => (
            <div className={styles.row} key={color.name}>
              <span
                className={styles.colorBox}
                style={{
                    backgroundColor: color.hex
                }}
              />
              <div className={styles.colorHex}>
                {String(color.hex)}
              </div>
              <div className={styles.colorName}>{color.name}</div>
            </div>
            ))}
        </div>
      )
  }

  renderRow(color: DesignToken): Node[] {
    const subRows = [
      {
        text: color.hex,
        classnames: [styles.flexWithMargin, styles.multiLayerColorHex],
      },
      {
        text: color.path.join('-'),
        classnames: [styles.flexWithMargin, styles.designTokens]
      },
      {
        text: color.child,
        classnames: [styles.flexWithMargin, styles.child],
      },
      {
        text: color.parent,
        classnames: [styles.flexWithMargin, styles.parent],
      }
    ]

    const nodes = []

    for(let i = 0; i < subRows.length; i++) {
      const subRow = subRows[i]
      nodes.push(
        <>
          <li className={classNames(subRow.classnames)}>
            <div
              style={{
                backgroundColor: color.hex,
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                border: '1px solid var(--yoroi-palette-gray-200)',
              }}
            />
            <div>{subRow.text}</div>
          </li>
          {i < subRows.length -1 && <li className={styles.arrowDown}><ArrowDown /></li>}
        </>
      )
    }

    return nodes
  }
}
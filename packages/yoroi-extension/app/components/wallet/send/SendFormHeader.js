// @flow

import { Component, Node } from 'react';
import styles from './SendFormHeader.scss'
import classnames from 'classnames'

type Props = {|
    step: number,
|}

const TABS = [
    {
        title: 'Receiver',
        step: 1,
    },
    {
        title: 'Amount',
        step: 2,
    },
    {
        title: 'Preview',
        step: 3,
    }
]

/**
 * @todos
 * Add layout
 * add intl
 */
export default class SendFromHeader extends Component<Props> {
    render() :Node {
      const { step: currentStep } = this.props

      return (
        <div className={styles.component}>
          <ul className={styles.header}>
            {TABS.map(tab => (
              <li key={tab.step}>
                <p className={
                  classnames(
                    [styles.tab, currentStep === tab.step ? styles.tabActive : styles.tabInActive ]
                  )
                }
                >{tab.title}
                </p>
                <div className={
                  tab.step === currentStep ?
                  styles.halfBar : tab.step < currentStep && styles.fullBar
                }
                >
                  <span className={styles.dot} />
                </div>
              </li>
              ))
            }
          </ul>
        </div>
      )
    }
}
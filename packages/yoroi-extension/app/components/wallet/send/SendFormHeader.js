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

    getBarClassnames = (tabStep: number, currentStep: number) => {
      /**
       * @Note
       * `eslint` doesn't allow ternary expressions
       */
      if (tabStep === currentStep ) return styles.halfBar
      if (tabStep < currentStep) return styles.fullBar
      return styles.noBar
    }

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
                >
                  {tab.title}
                </p>
                <div className={this.getBarClassnames(tab.step, currentStep)}>
                  <span className={styles.right} />
                  <span className={styles.dot} />
                  <span className={styles.left} />
                </div>
              </li>
              ))
            }
          </ul>
        </div>
      )
    }
}
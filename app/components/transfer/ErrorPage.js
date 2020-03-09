// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './ErrorPage.scss';

type Props = {|
  +error?: ?LocalizableError,
  +onCancel: void => void,
  +title: string,
  +backButtonLabel: string,
  +classicTheme: boolean,
|};

@observer
export default class ErrorPage extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { error, onCancel, title, backButtonLabel, } = this.props;
    const backButtonClasses = classnames([
      'secondary',
      styles.button,
    ]);

    return (
      <div className={styles.component}>

        <div>
          <div className={styles.body}>

            <div className={styles.title}>
              {title}
            </div>

            {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

            <div className={styles.buttonsWrapper}>
              <Button
                className={backButtonClasses}
                label={backButtonLabel}
                onClick={onCancel}
                skin={ButtonSkin}
              />
            </div>

          </div>
        </div>

      </div>
    );
  }
}

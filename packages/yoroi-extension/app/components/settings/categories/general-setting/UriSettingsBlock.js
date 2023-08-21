// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import { intlShape } from 'react-intl';
import styles from './UriSettingsBlock.scss';
import globalMessages from '../../../../i18n/global-messages';
import { observable, runInAction } from 'mobx';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../../styles/context/layout';

type Props = {|
  +registerUriScheme: void => void,
  +isFirefox: boolean,
|};
type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class UriSettingsBlock extends Component<Props & InjectedProps> {
  @observable hasPressed: boolean = false;

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isRevampLayout } = this.props;

    // On firefox since there is no prompt,
    // We need to give the user feedback that they pressed the button
    const isDisabled = this.props.isFirefox && this.hasPressed;

    return (
      <div className={styles.component}>
        <h2 className={styles.title}>{intl.formatMessage(globalMessages.uriSchemeLabel)}</h2>
        <p>{intl.formatMessage(globalMessages.uriExplanation)}</p>

        <Button
          className="allowButton"
          variant={isRevampLayout ? 'contained' : 'primary'}
          onClick={() => {
            this.props.registerUriScheme();
            runInAction(() => {
              this.hasPressed = true;
            });
          }}
          disabled={isDisabled}
          sx={{
            width: '287px',
            marginTop: '20px',
          }}
        >
          {intl.formatMessage(globalMessages.allowLabel)}
        </Button>
      </div>
    );
  }
}

export default (withLayout(UriSettingsBlock): ComponentType<Props>);

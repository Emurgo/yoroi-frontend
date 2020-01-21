// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './ExplorerSettings.scss';
import globalMessages from '../../../../i18n/global-messages';
import type { ExplorerType } from '../../../../domain/Explorer';


type Props = {|
  +explorers: Array<{| value: ExplorerType, label: string |}>,
  +selectedExplorer: ExplorerType,
  +onSelectExplorer: {| explorer: ExplorerType |} => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

@observer
export default class ExplorerSettings extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  selectExplorer: ExplorerType => Promise<void> = async (explorer) => {
    await this.props.onSelectExplorer({ explorer });
  };

  form = new ReactToolboxMobxForm({
    fields: {
      explorerId: {
        label: this.context.intl.formatMessage(globalMessages.blockchainExplorer),
        value: this.props.selectedExplorer
      }
    }
  });

  render() {
    const { explorers, isSubmitting, error } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const explorerId = form.$('explorerId');
    const componentClassNames = classNames([styles.component, 'explorer']);
    const explorerelectClassNames = classNames([
      styles.explorer,
      isSubmitting ? styles.submitExplorerSpinner : null,
    ]);
    return (
      <div className={componentClassNames}>
        <Select
          className={explorerelectClassNames}
          options={explorers}
          {...explorerId.bind()}
          value={this.props.selectedExplorer}
          onChange={this.selectExplorer}
          skin={SelectSkin}
        />
        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
      </div>
    );
  }

}

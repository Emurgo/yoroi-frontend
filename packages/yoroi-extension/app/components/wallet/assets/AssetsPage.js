// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { NumericInput } from 'react-polymorph/lib/components/NumericInput';
import { defineMessages, intlShape } from 'react-intl';
import { isValidMemoOptional, isValidMemo, } from '../../../utils/validations';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import AmountInputSkin from '../skins/AmountInputSkin';
import AddMemoSvg from '../../../assets/images/add-memo.inline.svg';
import BorderedBox from '../../widgets/BorderedBox';
import styles from './AssetsPage.scss';
import globalMessages, { memoMessages, } from '../../../i18n/global-messages';
import type { UriParams } from '../../../utils/URIHandling';
import { getAddressPayload, isValidReceiveAddress } from '../../../api/ada/lib/storage/bridge/utils';
import { MAX_MEMO_SIZE } from '../../../config/externalStorageConfig';
import type { TokenRow, NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  formattedAmountToBigNumber,
  formattedAmountToNaturalUnits,
  truncateToken,
} from '../../../utils/formatters';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import LocalizableError from '../../../i18n/LocalizableError';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import { getTokenName, genFormatTokenAmount, getTokenStrictName, getTokenIdentifierIfExists, } from '../../../stores/stateless/tokenHelpers';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type {
  TokenEntry,
  TokenLookupKey,
} from '../../../api/common/lib/MultiToken';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectTokenSkin } from '../../../themes/skins/SelectTokenSkin';
import TokenOptionRow from '../../widgets/tokenOption/TokenOptionRow';
import BigNumber from 'bignumber.js';
import AssetsList from './AssetsList';
import type { Asset } from './AssetsList';


const messages = defineMessages({});

type Props = {|
  +assetsList: Asset[],
|};

@observer
export default class AssetsPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };


  /**
   * @todo
   * Change the icon 
   * apply translations 
   * remove unused code
   */

  render(): Node {

    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <AssetsList assetsList={this.props.assetsList} />
      </div>
    );
  }
}
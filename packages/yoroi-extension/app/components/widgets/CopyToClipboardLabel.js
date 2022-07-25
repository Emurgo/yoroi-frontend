// @flow
import type { ComponentType, Node } from 'react';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ButtonBase, Tooltip } from '@mui/material';
import { injectIntl } from 'react-intl';
import { copyableMessages } from './CopyableAddress';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';

type Props = {|
  text: string,
  children: Node,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function CopyToClipboardLabel({ text, children, intl }: Props & Intl): Node {
  const [isCopied, setIsCopied] = useState(false);

  const onCopyText = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <CopyToClipboard text={text} onCopy={onCopyText}>
      <Tooltip
        title={
          isCopied
            ? intl.formatMessage(copyableMessages.copied)
            : intl.formatMessage(copyableMessages.copyTooltipMessage)
        }
        placement="top"
      >
        <ButtonBase
          sx={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            color: 'inherit',
          }}
          data-clipboard-text={text}
        >
          {children}
        </ButtonBase>
      </Tooltip>
    </CopyToClipboard>
  );
}
export default (injectIntl(CopyToClipboardLabel): ComponentType<Props>);

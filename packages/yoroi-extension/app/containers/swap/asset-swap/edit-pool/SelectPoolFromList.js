// @flow
import SelectPoolDialog from '../../../../components/swap/SelectPoolDialog';

type Props = {|
  +onClose: void => void,
|}

export default function SelectSwapPoolFromList({ onClose }: Props): React$Node {
  // TODO: provide proper pool list
  return <SelectPoolDialog
    onPoolSelected={() => {}}
    poolList={[]}
    currentPool='test'
    onClose={onClose}
  />;
}

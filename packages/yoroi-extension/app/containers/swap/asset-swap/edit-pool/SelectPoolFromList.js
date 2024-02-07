// @flow
import SelectPoolDialog from '../../../../components/swap/SelectPoolDialog';

export default function SelectSwapPoolFromList({ onClose }) {
  // TODO: provide proper pool list
  return <SelectPoolDialog
    onPoolSelected={() => {}}
    poolList={[]}
    currentPool={'test'}
    onClose={onClose}
  />;
}

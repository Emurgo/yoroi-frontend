import NftsLayout from './layout';
import NftDetails from '../../features/nfts/useCases/NftDetails';

type Props = {
  stores: any;
};

const NftDetailsPage = (props: Props) => {
  return (
    <NftsLayout {...props}>
      <NftDetails />
    </NftsLayout>
  );
};

export default NftDetailsPage;

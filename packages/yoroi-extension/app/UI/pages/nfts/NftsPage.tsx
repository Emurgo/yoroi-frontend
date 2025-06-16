import NftsLayout from './layout';
import NftGallery from '../../features/nfts/useCases/NftGallery';

type Props = {
  stores: any;
};

const NftsPage = (props: Props) => {
  return (
    <NftsLayout {...props}>
      <NftGallery />
    </NftsLayout>
  );
};

export default NftsPage;

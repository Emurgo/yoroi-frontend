import WalletLayout from './layout';

type Props = {
  stores: any;
};

const WalletReceivePage = (props: Props) => {
  return <WalletLayout {...props}>"WalletReceivePage"</WalletLayout>;
};

export default WalletReceivePage;

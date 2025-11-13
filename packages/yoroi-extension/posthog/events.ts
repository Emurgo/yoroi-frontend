export interface EventDefinitions {
  'Transaction Review Modal Viewed': [
    {
      type: 'swap' | 'send' | 'dapp' | 'delegate' | 'undelegate' | 'withdraw rewards' | 'delegate vote';
      asset_count: number;
      asset_list: string;
    },
  ];
  'Payment Urls Page Viewed': [];
  'Send Initiated': [];
  'Send Select Asset Page Viewed': [];
  'Staking Center Page Viewed': [];
  'Governance Dashboard Page Viewed': [];
  'Wallet Page Exchange Clicked': [];
  'Portfolio Dashboard Page Viewed': [];
  'NFT Gallery Page Viewed': [];
  'NFT Gallery Details Page Viewed': [];
  'Connector Page Viewed': [];
  'Dapp Popup Connect Wallet Page Viewed': [];
  'Receive Page Viewed': [];
  'Connect Wallet Check Page Viewed': [];
  'Connect Wallet Details Page Viewed': [];
  'Connect Wallet Details Submitted': [{ hardware_wallet: 'Trezor' | 'Ledger' }];
  'Create Wallet Select Method Page Viewed': [];
  'Create Wallet Learn Phrase Step Viewed': [];
  'Create Wallet Save Phrase Step Viewed': [];
  'Create Wallet Verify Phrase Step Viewed': [];
  'Create Wallet Details Submitted': [];
  'Restore Wallet Enter Phrase Step Viewed': [];
  'Voting Page Viewed': [];
  'Cashback Dashboard Viewed': [];
  'Settings Page Viewed': [];
  'Transactions Page Viewed': [];
  'Midnight Airdrop Page Viewed': [];
  'Swap Initiated': [];
  'Swap Review Page Viewed': [];
}

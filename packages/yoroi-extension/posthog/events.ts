export interface EventDefinitions {
  'Settings Page Viewed': [],
  'Transaction Review Modal Viewed': [{
    type:
      | 'swap'
      | 'send'
      | 'dapp'
      | 'delegate'
      | 'undelegate'
      | 'withdraw rewards'
      | 'delegate vote'
    asset_count: number
    asset_list: string
  }],
  'Payment Urls Page Viewed': [],
  'Send Initiated': [],
  'Send Select Asset Page Viewed': [],
  'Staking Center Page Viewed': [],
  'Governance Dashboard Page Viewed': [],
  'Wallet Page Exchange Clicked': [],
  'Portfolio Dashboard Page Viewed': [],
  'NFT Gallery Page Viewed': [],
  'NFT Gallery Details Page Viewed': [],
  'Connector Page Viewed': [],
}

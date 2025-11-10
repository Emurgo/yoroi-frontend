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
}

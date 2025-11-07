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
}

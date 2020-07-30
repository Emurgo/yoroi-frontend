Feature: Transfer Yoroi Wallet funds

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen

  @it-114
  Scenario: Yoroi transfer fails when user transfers from an empty wallet (IT-114)
    Given There is a wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the 15-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |
    And I proceed with the recovery
    Then I should see a plate XJOD-1073
    Then I click the next button
    Then I should see the Yoroi transfer error screen
  
  @it-111
  Scenario: User can transfer funds from another Yoroi wallet (IT-111)
    # The recovery phrase and its balance(s) are defined in 
    # /features/mock-chain/TestWallets.js and
    # /features/mock-chain/mockImporter.js
    Given There is a wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the 15-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | dragon mango general very inmate idea rabbit pencil element bleak term cart critic kite pill |
    And I proceed with the recovery
    Then I should see a plate EDAO-9229
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |   
    | Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV | 1234567898765    |
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen
    
  @it-112
  Scenario: Yoroi transfer should be disabled when user hasn't created a wallet (IT-112)
    And I am on the transfer start screen
    Then I should see the transfer screen disabled

  @it-113
  Scenario: Wallet changes after transaction is generated (IT-113)
    Given There is a wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the 15-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                            |
    | final autumn bacon fold horse scissors act pole country focus task blush basket move view |
    And I proceed with the recovery
    Then I should see a plate ZKTZ-4614
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount |   
    | Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr | 4      |
    | Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj | 1      |
    | Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3 | 820000 |
    | Ae2tdPwUPEZJZPsFg8w5bXA4brfu8peYy5prmrFiYPACb7DX64iiBY8WvHD | 820000 |
    | Ae2tdPwUPEZHG9AGUYWqFcM5zFn74qdEx2TqyZxuU68CQ33EBodWAVJ523w | 820000 |
    | Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd | 650000 |
    Then A successful tx gets sent from my wallet from another client
    When I confirm Yoroi transfer funds
    Then I should see wallet changed notice
    And I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |
    | Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr | 4      |
    | Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj | 1      |
    | Ae2tdPwUPEZJZPsFg8w5bXA4brfu8peYy5prmrFiYPACb7DX64iiBY8WvHD | 820000 |
    | Ae2tdPwUPEZHG9AGUYWqFcM5zFn74qdEx2TqyZxuU68CQ33EBodWAVJ523w | 820000 |
    | Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd | 650000 |
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen

  @it-115
  Scenario: User can transfer funds from a trezor wallet (IT-115)
    Given There is a wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the trezor option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | dragon mango general very inmate idea rabbit pencil element bleak term cart critic kite pill |
    And I proceed with the recovery
    Then I should see a plate EDAO-9229
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |
    | Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV | 1234567898765    |
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen

  @it-82
  Scenario: User can transfer funds from another Yoroi paper wallet (IT-82)
    # The recovery phrase and its balance(s) are defined in 
    # /features/mock-chain/TestWallets.js and
    # /features/mock-chain/mockImporter.js
    Given There is a wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the yoroi paper wallet option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | mushroom expose slogan wagon uphold train absurd fix snake unable rescue curious escape member resource garbage enemy champion airport matrix year |
    And I enter the paper wallet password "cool password"
    And I proceed with the recovery
    Then I should see a plate KOTZ-1730
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |   
    | Ae2tdPwUPEZ7TQpzbJZCbA5BjW4zWYFn47jKo43ouvfe4EABoCfvEjwYvJr | 2000000    |
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen
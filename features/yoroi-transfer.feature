Feature: Transfer Yoroi Wallet funds

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Given There is a wallet stored named empty-wallet

  @it-110
  Scenario: Yoroi transfer fails when user transfers from an empty wallet (IT-110)
    And I am on the Yoroi Transfer start screen
    When I click on the next button on the Yoroi Transfer start screen
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |
    And I proceed with the recovery
    Then I should see the Yoroi transfer error screen
  
  @it-111
  Scenario: User can transfer funds from another Yoroi wallet (IT-111)
    # The recovery phrase and its balance(s) are defined in 
    # /features/mock-chain/TestWallets.js and
    # /features/mock-chain/mockImporter.js 
    And I am on the Yoroi Transfer start screen
    When I click on the next button on the Yoroi Transfer start screen
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | dragon mango general very inmate idea rabbit pencil element bleak term cart critic kite pill |
    And I proceed with the recovery
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |   
    | Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV | 1234567898765    |
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen
    

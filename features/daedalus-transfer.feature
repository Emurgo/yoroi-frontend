Feature: Transfer Daedalus Wallet funds

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Daedalus transfer funds Screen"

  Scenario: I follow setup instructions
    Given I am on the Daedalus Transfer screen
    When I click on the create Icarus wallet button
    Then I should see the Create wallet screen

  Scenario: I have access to a working copy of my Daedalus wallet
    Given There is a wallet stored named Test
    And I am on the Daedalus Transfer screen
    When I click on the go to the Receive screen button
    Then I should see the Receive screen

  Scenario: Transfer fail when I try to transfer funds from an Icarus wallet
    Given There is a wallet stored named Test
    And I am on the Daedalus Transfer screen
    When I click on the transfer funds from Daedalus button
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |
    And I proceed with the recovery
    Then I should see an "Invalid recovery phrase" error message
  
  Scenario: Try to transfer funds from my Daedalus wallet but connection is lost
    Given There is a wallet stored named Test
    And I am on the Daedalus Transfer screen
    When I click on the transfer funds from Daedalus button
    And I enter the recovery phrase:
    | recoveryPhrase                                                          |
    | leaf immune metal phrase river cool domain snow year below result three |
    And I proceed with the recovery
    Then I should see an Error screen
  
  @withWebSocketConnection
  Scenario: I transfer funds from my Daedalus wallet
    Given There is a wallet stored named Test
    And My Daedalus wallet has funds
    And I am on the Daedalus Transfer screen
    When I click on the transfer funds from Daedalus button
    And I enter the recovery phrase:
    | recoveryPhrase                                                          |
    | leaf immune metal phrase river cool domain snow year below result three |
    And I proceed with the recovery
    Then I should wait until funds are recovered:
    | daedalusAddress                                                                                          | amount |   
    | DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb | 500000 |
    | DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm | 500000 |
    When I confirm Daedalus transfer funds
    Then I should see the summary screen
    
  @withWebSocketConnection
  Scenario: Try to transfer funds from my Daedalus wallet but it doesn't have funds
    Given There is a wallet stored named Test
    And My Daedalus wallet hasn't funds
    And I am on the Daedalus Transfer screen
    When I click on the transfer funds from Daedalus button
    And I enter the recovery phrase:
    | recoveryPhrase                                                          |
    | leaf immune metal phrase river cool domain snow year below result three |
    And I proceed with the recovery
    Then I should see an Error screen

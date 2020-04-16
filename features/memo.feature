Feature: Memos
  Background:
    Given I have opened the extension
    And I have completed the basic setup
    
  @it-97
  Scenario: Create and edit transaction memo (IT-97)
    Given There is a wallet stored named small-single-tx
    Given I expand the top transaction
    # test add
    When I add a memo that says "my awesome memo"
    Then The memo content says "my awesome memo"
    # test edit
    When I edit the memo to say "my edited memo"
    Then The memo content says "my edited memo"
    # make sure memo is still there after refreshing
    Given I refresh the page
    And I expand the top transaction
    Then The memo content says "my edited memo"
    # test delete
    When I delete the memo
    Then There is no memo for the transaction

  @it-98
  Scenario: Create a transaction with a memo (IT-98)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.001000 |
    When I add a transaction memo that says "my awesome memo"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    Then I should see no warning block
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the summary screen
    And I expand the top transaction
    Then The memo content says "my awesome memo"

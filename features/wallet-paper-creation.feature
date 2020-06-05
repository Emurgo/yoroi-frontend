Feature: Wallet Paper creation

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-77
  Scenario: Paper wallet creation (IT-77)
    When I click the create button
    Then I select Cardano
    Then I select Paper Wallet
    Then I open Number of Adddresses selection dropdown
    And I select 2 addresses
    Then I click the create paper wallet button
    Then I enter the paper wallet password "cool password"
    And I repeat the wallet password "cool password"
    Then I click the next button
    # wait for paper wallet generation then go to next
    Then I click the next button
    And I enter the paper recovery phrase
    And I enter the paper wallet password "cool password"
    # swap addresses for UI testing
    Given I swap the paper wallet addresses
    Then I click then button labeled "Verify wallet"
    Then I should see two addresses displayed
    Then I click the next button
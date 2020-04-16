Feature: Migration

  Background:
    Given I have opened the extension
    
  @it-83
  Scenario: Version set on first launch (IT-83)
    And I am on the language selection screen
    Then Last launch version is updated

    # refreshing language select page causes the language to be unset
    # to avoid this, move to next page
    Then I submit the language selection form
    And I am on the "Terms of use" screen

    Then I decrease last launch version
    # need to refresh to trigger migration (only happens on app load)
    Given I refresh the page

    # wait for refresh to finish
    Given I am on the "Terms of use" screen
    Then The Japanese language should be selected
    And Last launch version is updated

  @it-85
  Scenario Outline: Version set on first launch (IT-85)
    Then I am on the language selection screen
    # make sure all major functionality work
    # even if user hasn't launched Yoroi since the very first version
    Given I import a snapshot named historical-versions/1_0_4/software
    Then I accept uri registration
    Then I should see the summary screen
    Then I should see a plate EDAO-9229
    # make sure tx screen is right
    When I see the transactions summary
    Then I should see that the number of transactions is 1
    And I should see 1 successful transactions
    # make sure receive screen is right
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEYwqhm4h1XJ1YkKhYY4tgymXmGLA1UoRySc8zTG2wAfbBijXz3 |
    | Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV |
    # make sure can still send transactions
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    Then I should see no warning block
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | amount              | fee       |
      | 0.001000            | 0.168082  |

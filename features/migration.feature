Feature: Migration

  Background:
    Given I have opened the extension
    
  @it-83
  Scenario: Version set on first launch (IT-83)
    And I am on the language selection screen
    Then Last launch version is updated
    Then I decrease last launch version
    # refreshing language select page causes the language to be unset
    # to avoid this, move to next page
    Then I submit the language selection form
    Given I refresh the page
    # this will trigger migration to start
    And I am on the "Terms of use" screen
    Given I refresh the page
    # refesh UI to take into account migration changes
    Given I am on the "Terms of use" screen
    Then The Japanese language should be selected

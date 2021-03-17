Feature: Voting Flow

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-173
  Scenario: User can register for voting (IT-173)
    Given There is a Shelley wallet stored named shelley-simple-15
    Given I go to the voting page
    When I click on the register button in the voting page
    Then I see the Auto generated Pin Steps
    When I click next on the generated pin step
    Then I see the confirm Pin step
    And I enter the generated pin
    And I click next on the confirm pin step
    Then I see register step with spending password
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I click next on the register step
    Then I see confirm transaction step
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then Then I see qr code step

  @it-174
  Scenario: User enters wrong pin (IT-174)
    Given There is a Shelley wallet stored named shelley-simple-15
    Given I go to the voting page
    When I click on the register button in the voting page
    Then I see the Auto generated Pin Steps
    When I click next on the generated pin step
    Then I see the confirm Pin step
    And I enter the wrong pin
    And I click next on the confirm pin step
    Then I see should see pin mismatch error
    And I see the confirm Pin step

  @it-175
  Scenario: User enters wrong pin and can continue with correct pin (IT-175)
    Given There is a Shelley wallet stored named shelley-simple-15
    Given I go to the voting page
    When I click on the register button in the voting page
    Then I see the Auto generated Pin Steps
    When I click next on the generated pin step
    Then I see the confirm Pin step
    And I enter the wrong pin
    And I click next on the confirm pin step
    Then I see should see pin mismatch error
    And I see the confirm Pin step
    And I enter the generated pin
    And I click next on the confirm pin step
    Then I see register step with spending password
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I click next on the register step
    Then I see confirm transaction step
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then Then I see qr code step

  @it-176
  Scenario: User enters incorrect spending password in generate step (IT-176)
    Given There is a Shelley wallet stored named shelley-simple-15
    Given I go to the voting page
    When I click on the register button in the voting page
    Then I see the Auto generated Pin Steps
    When I click next on the generated pin step
    Then I see the confirm Pin step
    And I enter the generated pin
    And I click next on the confirm pin step
    Then I see register step with spending password
    And I enter the wallet password:
      | password   |
      | wrongpassword |
    And I click next on the register step
    Then I see incorrect wallet password dialog

  @it-177
  Scenario: User enters incorrect spending password in transaction step (IT-177)
    Given There is a Shelley wallet stored named shelley-simple-15
    Given I go to the voting page
    When I click on the register button in the voting page
    Then I see the Auto generated Pin Steps
    When I click next on the generated pin step
    Then I see the confirm Pin step
    And I enter the generated pin
    And I click next on the confirm pin step
    Then I see register step with spending password
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I click next on the register step
    Then I see confirm transaction step
    And I enter the wallet password:
      | password   |
      | wrongpassword |
    And I submit the wallet send form
    Then I see incorrect wallet password error in transaction step

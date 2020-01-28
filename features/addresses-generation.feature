Feature: Generate Addresses
  Background:
    Given I have opened the extension
    And I have completed the basic setup
    And There is a wallet stored named small-single-tx
    And I go to the receive screen

  @it-106
  Scenario: Latest address should be displayed at the top (IT-106)
    Then I should see my latest address "Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc" at the top
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |

  @it-17
  Scenario: Generate a new receive address (IT-17)
    When I click on the Generate new address button
    Then I should see my latest address "Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS" at the top
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS |
    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |

  @it-49
  Scenario: User can't create more than 20 consecutive unused addresses (IT-49)
    When I click on the Generate new address button 20 times
    And  I click on the Generate new address button
    Then I should see an error about max unused addresses

  @it-34
  Scenario: Ensure every generated wallet address is unique (IT-34)
    When I click on the Generate new address button 20 times
    Then I see every generated address is unique

  @it-22
  Scenario: Ensure user can hide used Addresses under "Receive tab" (IT-22)
    When I click on the Generate new address button
    And I click on the Hide used addresses button
    Then I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS |
    And I shouldn't see the address "Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc"

  @it-88
  Scenario: Ensure user can see internal address in "Receive tab" (IT-88)
    When I click on the internal tab
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZ3o8HadjafhGnNEqxwQm4V98Nm3kADDsfTv8QE2Ytpe2L8TSL |

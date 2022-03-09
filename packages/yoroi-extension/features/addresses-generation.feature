Feature: Generate Addresses
  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-106
  Scenario: Latest address should be displayed at the top (IT-106)
    Given There is a Byron wallet stored named small-single-tx
    Then I switch to revamp version
#    And I go to the receive screen
#    Then I should see my latest address "Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS" at the top
#    And I should see the addresses exactly list them
#    | address                                                     |
#    | Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS |
#    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |

  @it-17
  Scenario: Generate a new receive address (IT-17)
    Given There is a Byron wallet stored named small-single-tx
    And I go to the receive screen
    When I click on the Generate new address button
    Then I should see my latest address "Ae2tdPwUPEZHGGpp6RV9N9qPsAjHFWfbQzoD9unBmPDoJpMQW129GWPVU1X" at the top
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZHGGpp6RV9N9qPsAjHFWfbQzoD9unBmPDoJpMQW129GWPVU1X |
    | Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS |
    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |

  @it-49
  Scenario: User can't create more than 20 consecutive unused addresses (IT-49)
    Given There is a Byron wallet stored named small-single-tx
    And I go to the receive screen
    When I click on the Generate new address button 20 times
    And  I click on the Generate new address button
    Then I should see an error about max unused addresses

  @it-34
  Scenario: Ensure every generated wallet address is unique (IT-34)
    Given There is a Byron wallet stored named small-single-tx
    And I go to the receive screen
    When I click on the Generate new address button 20 times
    Then I see every generated address is unique

  @it-22
  Scenario: Test filers in the receive tab "Receive tab" (IT-22)
    Given There is a Byron wallet stored named small-single-tx
    And I go to the receive screen
    # test unused
    And I click on the Unused addresses button
    Then I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS |
    And I shouldn't see the address "Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc"
    # test used
    And I click on the Used addresses button
    Then I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |
    And I shouldn't see the address "Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS"
    # test All
    And I click on the All addresses button
    Then I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS |
    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |
    # test HasBalance
    And I click on the HasBalance addresses button
    Then I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |
    And I shouldn't see the address "Ae2tdPwUPEZAbDBFpgzALfryWbvDtx6H6BMynDxWFuThQthW7HX93yJ3wRS"
    

  @it-88
  Scenario: Ensure user can see internal address in "Receive tab" (IT-88)
    Given There is a Byron wallet stored named small-single-tx
    And I go to the receive screen
    When I click on the byron internal tab
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZ3o8HadjafhGnNEqxwQm4V98Nm3kADDsfTv8QE2Ytpe2L8TSL |

  @it-122
  Scenario: Ensure user can see address book in "Receive tab" (IT-122)
    Given There is a Byron wallet stored named small-single-tx
    And I go to the receive screen
    When I click on the top-level address book tab
    Then I should see at least 13 addresses

  @it-145
  Scenario: Ensure user can see reward address in "Receive tab" (IT-145)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I go to the receive screen
    When I click on the top-level reward address tab
    Then I should see 1 addresses with address "stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9" at the top


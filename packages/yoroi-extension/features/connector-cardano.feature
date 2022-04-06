Feature: dApp connector data signing

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp

@it-1000
  Scenario: dApp can get balance (IT-1000)
    And I request anonymous access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    Then The dApp should see balance 5500000
    Then I request signing the transaction:
    | amount | toAddress                                                                                               |
    | 3      | addr1q97xu8uvdgjpqum6sjv9vptzulkc53x7tk69vj2lynywxppq3e92djqml4tjxz2avcgem3u8z7r54yvysm20qasxx5gqyx8evw |
    Then I should see the connector popup
    And I should see the transaction amount data:
    | amount | fee      |
    | 3      | 0.168317 |
    And I should see the transaction addresses info:
    | fromAddress   | fromAddressAmount | toAddress     | toAddressAmount |
    | addr1...ajfkn | -5.5              | addr1...x8evw | 3               |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
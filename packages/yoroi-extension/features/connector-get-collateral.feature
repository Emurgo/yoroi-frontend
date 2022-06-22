@dApp
Feature: dApp connector get collateral

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    
    
  @dApp-1023
  Scenario: dApp, anonymous wallet, get collateral
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then The dApp should see collateral: {"utxo_id":"3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba211","tx_hash":"3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba21","tx_index":1,"receiver":"addr1qyv7qlaucathxkwkc503ujw0rv9lfj2rkj96feyst2rs9ey4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqzajfkn","amount":"5500000","assets":[]} for 490000

  @dApp-1024
  Scenario: dApp, authorized wallet, get collateral
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then The dApp should see collateral: {"utxo_id":"3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba211","tx_hash":"3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba21","tx_index":1,"receiver":"addr1qyv7qlaucathxkwkc503ujw0rv9lfj2rkj96feyst2rs9ey4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqzajfkn","amount":"5500000","assets":[]} for 490000

@dApp-1025
  Scenario: dApp, authorized wallet, get collateral, connector popup
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I ask to get Collateral for 2000000 Utxos
    Then I should see the connector popup to Add Collateral
    And I should see the collateral fee data:
    | fee   |
    | 0.171177 |
    And I should see the collateral from address info:
    | fromAddress   | fromAddressAmount |
    | addr1...ajfkn | -5.5 |
    And I should see the collateral to addresses info:
    | toAddresses   | toAddressesAmount |
    | addr1...qef6t | +1 |
    | addr1...psz23 | +1 |
    | addr1...psz23 | +3.328823 |
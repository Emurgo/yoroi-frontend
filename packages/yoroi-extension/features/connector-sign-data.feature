@dApp
Feature: dApp connector data signing

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab

  @dApp-sign
  Scenario: dApp, anonymous wallet, sign Cardano data
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request signing the data:
    | payload   |
    | sign data anonymous wallet |
    Then I should see the connector popup for signing data
    And I should see the data to sign:
    | payload   |
    | sign data anonymous wallet |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed

  @dApp-sign
  Scenario: dApp, authorised wallet, sign Cardano data
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request signing the data:
    | payload   |
    | sign data authorized wallet |
    Then I should see the connector popup for signing data
    And I should see the data to sign:
    | payload   |
    | sign data authorized wallet |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed

  @dApp-sign
  Scenario: dApp, anonymous wallet, signing data, cancel signing
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request signing the data:
    | payload   |
    | sign data anonymous wallet |
    Then I should see the connector popup for signing
    Then I cancel signing the transaction
    And The user reject for signing is received

  @dApp-sign
  Scenario: dApp, authorized wallet, signing data, cancel signing
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request signing the data:
    | payload   |
    | sign data anonymous wallet |
    Then I should see the connector popup for signing
    Then I cancel signing the transaction
    And The user reject for signing is received

  @dApp-collateral
  Scenario: dApp, anonymous wallet, get collateral
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then The dApp should see collateral: {"utxo_id":"3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba211","tx_hash":"3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba21","tx_index":1,"receiver":"addr1qyv7qlaucathxkwkc503ujw0rv9lfj2rkj96feyst2rs9ey4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqzajfkn","amount":"5500000","assets":[]}

  @dApp-collateral
  Scenario: dApp, authorized wallet, get collateral
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then The dApp should see collateral: {"utxo_id":"3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba211","tx_hash":"3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba21","tx_index":1,"receiver":"addr1qyv7qlaucathxkwkc503ujw0rv9lfj2rkj96feyst2rs9ey4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqzajfkn","amount":"5500000","assets":[]}
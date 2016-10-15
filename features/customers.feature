@stripe @customers
Feature: API user can process CRUD operations over customers endpoint
  In order to check functionality of customers endpoint
  As test automation engineer
  I need to create script checking validity of response and error handling

  @create @final
  Scenario: Create a customer
    When I do POST request to "customers" endpoint
    Then the response status code should be 200
    And the response property "object" should be "customer"
    And the response has object "sources" with property "object" set as "list"
    And the response has object "subscriptions" with property "object" set as "list"

  @retrieve @final
  Scenario: Retrieve a customer
    When I do POST request to "customers" endpoint
    Then the response status code should be 200
    When I do GET request to "customers/CUSTOMER_ID" endpoint
    Then the response status code should be 200

  @binfind @final
  Scenario: Validating card BIN number
    When I do GET request to "api/json/468108" endpoint
    Then the response status code should be 200
    And the response property "BIN" should be "468108"
    And the response property "brand" should be "Visa"
    And the response property "bank" should be "Wells Fargo Bank, N.A."
    And the response property "type" should be "Debit"
    And the response property "subType" should be "Classic"
    And the response property "country" should be "United States"